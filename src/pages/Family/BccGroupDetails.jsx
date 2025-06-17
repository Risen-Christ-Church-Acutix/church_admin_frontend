"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import DataTable from "../../components/DataTable";
import Layout from "../../components/Layout";
import { useToaster } from "../../components/Toaster";
import { ChevronLeft, Plus, Phone, MapPin } from "lucide-react";
import axiosInstance from "../../api-handler/api-handler";
import AddFamilyModal from "./AddFamilyModal";


const BccGroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToaster();
  const [groupData, setGroupData] = useState(null);
  const [familiesData, setFamiliesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState(null);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  // State for edit group form
  const [showEditGroupForm, setShowEditGroupForm] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupArea, setEditGroupArea] = useState("");
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);

  const fetchGroupAndFamilies = async () => {
    try {
      setIsLoading(true);
      const parsedGroupId = Number.parseInt(groupId);
      if (!groupId || isNaN(parsedGroupId)) {
        const errorMessage = `Invalid groupId: ${groupId}`;
        if (errorMessage !== lastError) {
          error(errorMessage);
          setLastError(errorMessage);
        }
        setGroupData(null);
        setFamiliesData([]);
        return;
      }

      const response = await axiosInstance.post("/api/parishioners/getFamiliesByBCCGroup", {
        bccGroupId: parsedGroupId,
        _t: Date.now(),
      });

      if (!response.data) {
        setGroupData(null);
        setFamiliesData([]);
        return;
      }

      // Set group data from response
      setGroupData({
        id: response.data.id,
        name: response.data.name,
        area: response.data.area,
        familyCount: response.data.familycount,
      });

      // Transform family data
      const transformedData = response.data.families.map((family) => ({
        id: family.id,
        name: `${family.name} 's family`,
        address: family.address,
        phone: family.phoneNumber,
        memberCount: family.memberCount,
      }));

      setFamiliesData(transformedData);
      setLastError(null);
    } catch (err) {
      const errorMessage = `Failed to fetch group and families data: ${err.message}`;
      if (errorMessage !== lastError) {
        error(errorMessage);
        setLastError(errorMessage);
      }
      setGroupData(null);
      setFamiliesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupAndFamilies();
  }, [groupId]);

  const openFamilyDetails = (id) => {
    const currentFamily = familiesData.find((fam) => fam.id === id);
    if (!currentFamily) {
      error("Family not found.");
      return;
    }
    navigate(`/parishioners/families/${id}`, {
      state: { groupId, groupName: groupData?.name || "Unknown Group", currentFamily },
    });
  };

  const familyColumns = [
    { key: "name", header: "Family Name" }, // Using placeholder name
    {
      key: "contact",
      header: "Contact",
      render: (_, item) => (
        <div className="text-sm">
          <div className="flex items-center text-amber-800">
            <Phone className="w-3 h-3 mr-1" /> {item.phone}
          </div>
        </div>
      ),
    },
    { key: "address", header: "Address", cellClassName: "text-sm" },
    {
      key: "memberCount",
      header: "Members",
      className: "text-center",
      cellClassName: "text-center",
      render: (value, item) => (
        <span
          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline"
          onClick={() => openFamilyDetails(item.id)}
        >
          {value}
        </span>
      ),
    },
  ];

  const handleEditFamily = (family) => {
    setEditingFamily(family);
    setEditAddress(family.address || "");
    setEditPhoneNumber(family.phone || "");
  };

  const submitFamilyUpdate = async () => {
    if (!editAddress.trim() || !editPhoneNumber.trim()) {
      error("Address and phone number cannot be empty.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axiosInstance.put("/api/parishioners/updateFamily", {
        id: editingFamily.id,
        address: editAddress,
        phoneNumber: editPhoneNumber,
      });

      if (response.status === 200) {
        success(`Family ID: ${editingFamily.id} updated successfully.`);
        setEditingFamily(null);
        fetchGroupAndFamilies();
      } else {
        error("Failed to update family.");
      }
    } catch (err) {
      error(err.response?.data?.message || "Error updating family.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewFamily = (family) => {
    navigate(`/parishioners/families/${family.id}`, { state: { groupId } });
  };

  const handleDeleteFamily = async (family) => {
    const reason = prompt(`Why are you inactivating "Family ID: ${family.id}"?`);

    if (reason === null) return;

    if (!reason || reason.trim() === "") {
      error("Inactivity reason is required.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to inactivate "Family ID: ${family.id}"?`);

    if (!confirmed) return;

    try {
      const response = await axiosInstance.put("/api/parishioners/inactivateFamily", {
        id: family.id,
        bccGroupId: Number.parseInt(groupId),
        inactivityReason: reason.trim(),
      });

      if (response.status === 200) {
        success(`Family ID: ${family.id} has been marked as inactive.`);
        fetchGroupAndFamilies();
      } else {
        error("Failed to inactivate family.");
      }
    } catch (err) {
      error(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Handler to open edit group form
  const handleEditGroup = () => {
    console.log("Edit Group button clicked, groupData:", groupData); // Debug log
    if (!groupData) {
      console.log("No groupData available");
      error("Group data not available.");
      return;
    }
    setEditGroupName(groupData.name || "");
    setEditGroupArea(groupData.area || "");
    setShowEditGroupForm(true);
    console.log("showEditGroupForm set to true"); // Debug log
  };

  // Handler to submit group update
  const submitGroupUpdate = async () => {
    console.log("Submitting group update:", { id: groupId, name: editGroupName, area: editGroupArea }); // Debug log
    if (!editGroupName.trim() || !editGroupArea.trim()) {
      error("Group name and area cannot be empty.");
      return;
    }

    setIsUpdatingGroup(true);
    try {
      const response = await axiosInstance.put("/api/parishioners/updateBCCGroup", {
        id: Number.parseInt(groupId),
        name: editGroupName,
        area: editGroupArea,
      });

      if (response.status === 200) {
        success(`Group updated successfully.`);
        setShowEditGroupForm(false);
        fetchGroupAndFamilies();
      } else {
        error("Failed to update group.");
      }
    } catch (err) {
      error(err.response?.data?.message || "Error updating group.");
      console.error(err);
    } finally {
      setIsUpdatingGroup(false);
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
            onClick={() => navigate("/parishioners")}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to BCC Groups
          </Button>
        </div>

        {/* BCC Group Info Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-2xl">{groupData?.name || "Loading..."}</CardTitle>
                <CardDescription className="text-amber-700">BCC Group Details</CardDescription>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleEditGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                Edit Group
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-amber-600">Loading group data...</div>
            ) : !groupData ? (
              <div className="text-center text-amber-600">No group data available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-amber-600">Area</div>
                  <div className="font-medium text-amber-900">{groupData.area}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-amber-600">Statistics</div>
                  <div className="font-medium text-amber-900">
                    <span className="text-blue-600">{groupData.familyCount} Families</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Group Form */}
        {showEditGroupForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-red-500 max-w-md w-full">
              <h3 className="text-amber-900 text-lg mb-4">Edit Group</h3>
              <div className="mb-4">
                <label className="block text-amber-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full border border-amber-300 rounded px-3 py-2"
                  placeholder="Enter group name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-amber-700 mb-1">Area</label>
                <input
                  type="text"
                  value={editGroupArea}
                  onChange={(e) => setEditGroupArea(e.target.value)}
                  className="w-full border border-amber-300 rounded px-3 py-2"
                  placeholder="Enter area"
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={submitGroupUpdate}
                  disabled={isUpdatingGroup}
                >
                  {isUpdatingGroup ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => {
                    console.log("Cancel button clicked, closing form"); // Debug log
                    setShowEditGroupForm(false);
                  }}
                  disabled={isUpdatingGroup}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Families Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  Families in {groupData?.name || "Group"}
                </CardTitle>
                <CardDescription className="text-amber-700">
                  {groupData?.familyCount || 0} registered families in this BCC group
                </CardDescription>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setShowAddFamilyForm(!showAddFamilyForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddFamilyForm ? "Close Form" : "Add New Family"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {showAddFamilyForm && (
              <AddFamilyModal
                groupId={groupId}
                fetchFamilies={fetchGroupAndFamilies}
                onClose={() => setShowAddFamilyForm(false)}
              />
            )}

            {editingFamily && (
              <div className="mb-6 p-4 border border-amber-300 rounded bg-amber-50">
                <h3 className="text-amber-900 text-lg mb-2">Edit Family ID: {editingFamily.id}</h3>
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-amber-300 rounded px-3 py-2"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    className="w-full border border-amber-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={submitFamilyUpdate}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingFamily(null)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center text-amber-600">Loading families...</div>
            ) : familiesData.length === 0 ? (
              <div className="text-center text-amber-600">
                {lastError ? `Error: ${lastError}` : "No families available for this group."}
              </div>
            ) : (
              <DataTable
                data={familiesData}
                columns={familyColumns}
                searchPlaceholder="Search families by name or address..."
                onEdit={handleEditFamily}
                onView={handleViewFamily}
                onDelete={handleDeleteFamily}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BccGroupDetails;