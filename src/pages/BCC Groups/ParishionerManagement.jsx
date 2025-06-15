"use client";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import DataTable from "../../components/DataTable";
import Layout from "../../components/Layout";
import { useToaster } from "../../components/Toaster";
import { Users, Home, UserCheck, Plus } from "lucide-react";
import axiosInstance from "../../api-handler/api-handler";
import { useEffect, useState } from "react";
import AddBccGroupModal from "./AddBccGroupModal";

const ParishionerManagement = () => {
  const navigate = useNavigate();
  const { success, error, warning } = useToaster();

  const [bccGroupsData, setBccGroupsData] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const [editBCCGroup, setEditBCCGroup] = useState(null);
  const [editName, setEditName] = useState("");
  const [editArea, setEditArea] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/api/parishioners/getInitialDetails");
      setBccGroupsData(res.data.groups);
      setStatsData({
        bccGroups: res.data.bccGroupsCount,
        families: res.data.familiesCount,
        parishioners: res.data.parishionersCount,
      });
    } catch (err) {
      console.log(err);
      error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditBccGroup = (group) => {
    setEditBCCGroup(group);
    setEditName(group.name);
    setEditArea(group.area);
  };

  const handleViewBccGroup = (group) => {
    navigate(`/parishioners/groups/${group.id}`);
  };

  const handleDeleteBccGroup = async (group) => {
    if (group.familycount > 0) {
      warning(
        `Cannot delete ${group.name}. Please move or remove all families first.`
      );
    } else {
      if (window.confirm(`Are you sure you want to delete ${group.name}?`)) {
        try {
          await axiosInstance.delete("/api/parishioners/deleteBCCGroup",{
            id:group.id
          });
          success(`${group.name} has been deleted successfully.`);
          fetchData();
        } catch (err) {
          console.error(err);
          error("Failed to delete the group.");
        }
      }
    }
  };

  const submitGroupUpdate = async () => {
    if (!editName.trim() || !editArea.trim()) {
      warning("Name and area fields cannot be empty.");
      return;
    }

    setIsUpdating(true);
    try {
      await axiosInstance.put("/api/parishioners/updateBCCGroup", {
        id:editBCCGroup.id,
        name: editName,
        area: editArea,
      });
      success(`${editName} has been updated successfully.`);
      setEditBCCGroup(null);
      fetchData();
    } catch (err) {
      console.error(err);
      error("Failed to update group.");
    } finally {
      setIsUpdating(false);
    }
  };

  const bccGroupColumns = [
    { key: "name", header: "Group Name" },
    { key: "area", header: "Area" },
    {
      key: "familycount",
      header: "No. of Families",
      className: "text-center align-middle",
      cellClassName: "text-center align-middle",
      render: (value, item) => (
        <div className="flex justify-center items-center">
          <span
            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate(`/parishioners/groups/${item.id}`)}
          >
            {value}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Parishioner Management
          </h2>
          <p className="text-amber-700">
            Manage BCC groups, families, and individual parishioners
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>BCC Groups</span>
                <Users className="w-8 h-8 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {statsData.bccGroups}
              </div>
              <p className="text-blue-100 text-sm">Active groups</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Families</span>
                <Home className="w-8 h-8 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {statsData.families}
              </div>
              <p className="text-green-100 text-sm">Registered families</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Parishioners</span>
                <UserCheck className="w-8 h-8 opacity-80" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {statsData.parishioners}
              </div>
              <p className="text-purple-100 text-sm">Total members</p>
            </CardContent>
          </Card>
        </div>

        {/* BCC Groups Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  BCC Groups
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Manage Basic Christian Communities and their members
                </CardDescription>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Group
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {showAddModal && (
              <AddBccGroupModal
                onClose={() => setShowAddModal(false)}
                fetchBccGroups={fetchData}
              />
            )}

            {editBCCGroup && (
              <div className="mb-6 p-4 border border-amber-300 rounded bg-amber-50">
                <h3 className="text-amber-900 text-lg mb-2">
                  Edit Group: {editBCCGroup.name}
                </h3>
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-amber-300 rounded px-3 py-2"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full border border-amber-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={submitGroupUpdate}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditBCCGroup(null)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <DataTable
              data={bccGroupsData}
              columns={bccGroupColumns}
              searchPlaceholder="Search groups by name or area..."
              onEdit={handleEditBccGroup}
              onView={handleViewBccGroup}
              onDelete={handleDeleteBccGroup}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ParishionerManagement;
