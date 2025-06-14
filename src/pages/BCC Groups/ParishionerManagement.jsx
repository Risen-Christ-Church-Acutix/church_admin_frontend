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

// const statsData = {
//   bccGroups: 12,
//   families: 156,
//   parishioners: 487,
// };

// const bccGroupsData = [
//   {
//     id: 1,
//     sno: 1,
//     name: "St. Mary's Group",
//     area: "Downtown Parish",
//     familycount: 15,
//   },
//   {
//     id: 2,
//     sno: 2,
//     name: "Sacred Heart Group",
//     area: "North Parish",
//     familycount: 12,
//   },
//   {
//     id: 3,
//     sno: 3,
//     name: "St. Joseph's Group",
//     area: "East Parish",
//     familycount: 18,
//   },
//   {
//     id: 4,
//     sno: 4,
//     name: "Holy Spirit Group",
//     area: "West Parish",
//     familycount: 10,
//   },
//   {
//     id: 5,
//     sno: 5,
//     name: "Divine Mercy Group",
//     area: "South Parish",
//     familycount: 14,
//   },
// ];

const ParishionerManagement = () => {
  const navigate = useNavigate();
  const { success, error, warning } = useToaster();
  const [bccGroupsData, setBccGroupsData] = useState([]);
  const [statsData, setStatsData] = useState({});
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/parishioners/getInitialDetails"
      );
      setBccGroupsData(res.data.groups);    
      setStatsData({
        bccGroups: res.data.bccGroupsCount,
        families: res.data.familiesCount,
        parishioners: res.data.parishionersCount,
      });
      console.log(bccGroupsData);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleEditBccGroup = (group) => {
    // Navigate to edit form or open modal
    success(`"Edit functionality for ${group.name} will be implemented"`);
  };

  const handleViewBccGroup = (group) => {
    navigate(`/parishioners/groups/${group.id}`);
  };

  const handleDeleteBccGroup = (group) => {
    if (group.familycount > 0) {
      warning(
        `Cannot delete ${group.name}. Please move or remove all families first.`
      );
    } else {
      // Show confirmation dialog
      if (window.confirm(`Are you sure you want to delete ${group.name}?`)) {
        success(`${group.name} has been deleted successfully.`);
      }
    }
  };

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
