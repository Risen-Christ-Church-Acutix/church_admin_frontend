"use client";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import DataTable from "../../components/DataTable";
import Layout from "../../components/Layout";
import { useToaster } from "../../components/Toaster";
import { ChevronLeft, Plus } from "lucide-react";
import axiosInstance from "../../api-handler/api-handler";
import { useEffect, useState } from "react";
import AddParishionerModal from "./AddParishionerModal";
const FamilyDetails = () => {
  const { familyId } = useParams();
  const location = useLocation();
  const groupId = location.state?.groupId;
  const groupName = location.state?.groupName;
  const currentFamily = location.state?.currentFamily;
  console.log(location.state);
  const navigate = useNavigate();
  const { success, error } = useToaster();
  const [showAddModal, setShowAddModal] = useState(false);
  const [priests, setPriests] = useState([]);
  const [parishionerData, setParishionerData] = useState([]);
  const [familyData, setFamilyData] = useState({
    bccGroup: {
      id: groupId,
      name: groupName,
    },
    phone: "",
    address: "",
    familyHeadName: "",
    memberCount: 0,
  });

  useEffect(() => {
    fetchData();
    setFamilyData((prev) => ({
      ...prev,
      bccGroup: {
        id: groupId,
        name: groupName,
      },
      phone: currentFamily.phone,
      address: currentFamily.address,
    }));

  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.post(
        "api/parishioners/getParishionersByFamily",
        {
          familyId: parseInt(familyId),
        }
      );
      console.log("Fetched parishioners:", res.data);
      const priestRes = await axiosInstance.get("/api/parishioners/getPriests");
      setPriests(priestRes.data);

      const members = res.data || [];
      const formatted = members.map((data, idx) => ({
        sno:idx+1,
        id: data.id,
        name: data.name,
        dob: data.dateOfBirth,
        gender: data.gender,
        sacraments: data.sacraments || [],
      }));

      const head = members.find(m => m.isFamilyHead);

      setFamilyData((prev) => ({
        ...prev,
        familyHeadName:head.name,
        memberCount: members.length,
      }));

      setParishionerData(formatted);
    } catch (err) {
      console.error("Failed to fetch parishioners:", err);
    }
  };

  const parishionerColumns = [
    {key:"sno",header:"S.No"},
    { key: "name", header: "Name" },
    {
      key: "dob",
      header: "Date of Birth",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "gender",
      header: "Gender",
      render: (value) => (
        <Badge
          variant="outline"
          className={
            value === "MALE"
              ? "border-blue-300 text-blue-700"
              : value === "FEMALE"
              ? "border-pink-300 text-pink-700"
              : "border-gray-300 text-gray-700"
          }
        >
          {value}
        </Badge>
      ),
    },
{
  key: "sacraments",
  header: "Sacraments Done",
  render: (value) =>
    value.length === 0 ? (
      <span className="text-gray-500 italic">No records found</span>
    ) : (
      <div className="flex flex-wrap gap-1">
        {value.map((sacrament, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`text-xs ${
              sacrament.type === "BAPTISM"
                ? "border-blue-300 text-blue-700"
                : sacrament.type === "FIRST_COMMUNION"
                ? "border-green-300 text-green-700"
                : sacrament.type === "CONFIRMATION"
                ? "border-purple-300 text-purple-700"
                : sacrament.type === "MARRIAGE"
                ? "border-red-300 text-red-700"
                : "border-gray-300 text-gray-700"
            }`}
          >
            {sacrament.type}
          </Badge>
        ))}
      </div>
    ),
}

  ];

  const [editData, setEditData] = useState({});
  const [newSacrament, setNewSacrament] = useState("");
  const [newPriest, setNewPriest] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleViewParishioner = (parishioner) => {
    success(`View functionality for ${parishioner.name} will be implemented`);
  };

  const handleEditParishioner = (parishioner) => {
    setEditData({
      id: parishioner.id,
      name: parishioner.name,
      completedSacraments: parishioner.sacraments || [],
    });
    setIsEditing(true);
    setNewSacrament("");
    setNewPriest("");
  };

  const handleDeleteParishioner = async (parishioner) => {
    const reason = prompt(
      "Please provide a reason for inactivating this parishioner:"
    );
    try {
      const res = await axiosInstance.put(
        "/api/parishioners/inactivateParishioner",
        {
          id: parseInt(parishioner.id),
          familyId: parseInt(familyId),
          inactivityReason: reason,
        }
      );
      success(`${parishioner.name} has been marked as inactive.`);
      fetchData();
    } catch (err) {
      error(
        err.response?.data?.message || "An error occurred while inactivating."
      );
      return;
    }
  };
  const handleEditSubmit = async () => {
    if (!editData.name.trim()) {
      error("Name must be filled.");
      return;
    }

    let payload = {};

    // Include new sacrament details only if type is provided
    if (newSacrament && newPriest?.id) {
      payload = {
        parishionerId: editData.id,
        type: newSacrament,
        date: Date.now(),
        priestId: newPriest?.id,
      };
    }

    try {
      const response = await axiosInstance.put(
        "/api/parishioners/updateParishioner",
        payload
      );
      if (newPriest?.id) {
        const sacramentResponse = await axiosInstance.post(
          "/api/parishioners/createSacramentRecord",
          {
            parishionerId: editData.id,
            type: newSacrament,
            date: new Date().toISOString(),

            priestId: newPriest.id,
          }
        );
      }

      if (response.status === 200) {
        fetchData();
        success("Family details updated successfully.");
        setIsEditing(false);
      } else {
        error("Update failed.");
      }
    } catch (err) {
      error(err.response?.data?.message || "An error occurred while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() =>
              navigate(`/parishioners/groups/${familyData.bccGroup.id}`)
            }
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to {familyData.bccGroup.name}
          </Button>
        </div>

        {/* Family Info */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <CardTitle className="text-amber-900 text-2xl">
              {familyData.familyHeadName}'s Family
            </CardTitle>
            <CardDescription className="text-amber-700">
              Phone: {familyData.phone} | Address: {familyData.address}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Parishioners Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  Family Members
                </CardTitle>
                <CardDescription className="text-amber-700">
                  {familyData.memberCount} registered parishioners in this
                  family
                </CardDescription>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  setShowAddModal(true);
                  setIsEditing(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Member
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {showAddModal && (
              <AddParishionerModal
                familyId={familyId}
                fetchParishioners={fetchData}
                onClose={() => setShowAddModal(false)}
              />
            )}
            {isEditing && (
              <div className="mb-6 p-4 border border-amber-300 rounded bg-amber-50">
                <h3 className="text-amber-900 text-lg mb-2">
                  Edit {editData.name}
                </h3>

                {/* Name Input */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-[330px] border border-amber-300 rounded px-3 py-2"
                  />
                </div>

                {/* Previously Completed Sacraments (read-only or editable list) */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">
                    Completed Sacraments
                  </label>
                  {editData.completedSacraments.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No sacraments recorded yet.
                    </p>
                  )}
                  <ul className="space-y-1">
                    {editData.completedSacraments.map((item, index) => {
                      const priestName =
                        priests.find((p) => p.id === item.priestId)?.name ||
                        "Unknown Priest";
                      return (
                        <li key={index} className="text-sm text-amber-900">
                          ✅ {item.type} by {priestName}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Add New Sacrament */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">
                    Add New Sacrament
                  </label>
                  <select
                    value={newSacrament}
                    onChange={(e) => {
                      setNewSacrament(e.target.value);
                      setNewPriest({});
                    }}
                    className="w-[330px] border border-amber-300 rounded px-3 py-2"
                  >
                    <option value="">Select sacrament</option>
                    <option value="BAPTISM">Baptism</option>
                    <option value="FIRST_COMMUNION">First Communion</option>
                    <option value="CONFIRMATION">Confirmation</option>
                    <option value="MARRIAGE">Marriage</option>
                    <option value="DEATH">Death</option>
                  </select>
                </div>

                {/* Select Priest for New Sacrament */}
                {newSacrament && (
                  <div className="mb-3">
                    <label className="block text-amber-700 mb-1">Priest</label>
                    <select
                      value={newPriest?.name || ""}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        const selectedPriest = priests.find(
                          (p) => p.name === selectedName
                        );
                        if (selectedPriest) {
                          setNewPriest({
                            id: selectedPriest.id,
                            name: selectedPriest.name,
                          });
                        } else {
                          setNewPriest(null); // fallback
                        }
                      }}
                      className="w-[330px] border border-amber-300 rounded px-3 py-2"
                    >
                      <option value="">Select priest</option>
                      {priests.map((priest) => (
                        <option key={priest.id} value={priest.name}>
                          {priest.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4">
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleEditSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setNewSacrament("");
                      setNewPriest({});
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <DataTable
              data={parishionerData}
              columns={parishionerColumns}
              searchPlaceholder="Search members by name..."
              onEdit={handleEditParishioner}
              onView={handleViewParishioner}
              onDelete={handleDeleteParishioner}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FamilyDetails;
