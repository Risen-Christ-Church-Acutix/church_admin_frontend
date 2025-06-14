import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { useToaster } from "../../components/Toaster";
import { X, Save } from "lucide-react";
import axiosInstance from "../../api-handler/api-handler";

const AddParishionerModal = ({ familyId, fetchParishioners, onClose }) => {
  const { success, error: toastError } = useToaster();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    DOB: "",
    gender: "",
  });

  const genderOptions = ["MALE", "FEMALE", "OTHER"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const date = `${formData.DOB}T00:00:00Z`;
    const dataToSend = {
      name: formData.name,
      DOB: date,
      gender: formData.gender,
      familyId: Number.parseInt(familyId),
    };

    try {
      await axiosInstance.post("/api/parishioners/addFamilyMember", dataToSend);
      success(`Parishioner "${formData.name}" added successfully`);
      await fetchParishioners();
      setFormData({
        name: "",
        DOB: "",
        gender: "",
      });
      onClose();
    } catch (err) {
      console.error("Error creating parishioner:", err.response?.data || err.message);
      toastError(err.response?.data?.message || "Failed to create parishioner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 p-6 rounded-lg mt-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-amber-900 text-xl">Add Parishioner</h3>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-amber-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3 w-[330px]"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="DOB" className="text-right">Date of Birth</Label>
              <Input
                id="DOB"
                name="DOB"
                type="date"
                value={formData.DOB}
                onChange={handleInputChange}
                className="col-span-3 w-[330px]"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={handleGenderChange}
                disabled={loading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddParishionerModal;
