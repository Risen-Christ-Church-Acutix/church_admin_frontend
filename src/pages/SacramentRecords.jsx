"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import DataTable from "../components/DataTable";
import Layout from "../components/Layout";
import { useToaster } from "../components/Toaster";
import { Plus, Calendar } from "lucide-react";
import axiosInstance from "../api-handler/api-handler";

const SacramentRecords = () => {
  const { success, error } = useToaster();
  const [sacraments, setSacraments] = useState([]);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priests, setPriests] = useState([]);

  useEffect(() => {
    fetchData();
    fetchPriests();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/api/sacraments/");
      const transformedData = res.data.map((s) => ({
        id: s.id,
        type: s.type,
        parishionerName: s.parishioner?.name || "N/A",
        date: s.date,
        priestId: s.priest?.id || "",
        priestName: s.priest?.name || "N/A",
      }));
      setSacraments(transformedData);
    } catch (err) {
      error("Failed to fetch sacrament records.");
    }
  };

  const fetchPriests = async () => {
    try {
      const res = await axiosInstance.get("/api/parishioners/getPriests");
      setPriests(res.data);
    } catch (err) {
      error("Failed to fetch priests.");
    }
  };

  const handleEditSacrament = (sacrament) => {
    setEditData({
      id: sacrament.id,
      type: sacrament.type,
      priestId: sacrament.priestId,
      priestName: sacrament.priestName,
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post(`/api/sacraments/update/${editData.id}`, {
        type: editData.type,
        priest:{
          id:editData.priestId,
        }
        
      });
      success("Sacrament updated successfully.");
      setIsEditing(false);
      fetchData();
    } catch (err) {
      error("Failed to update sacrament.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSacrament = async (sacrament) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this sacrament record for ${sacrament.parishionerName}?`
    );
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/sacraments/${sacrament.id}`);
      success("Sacrament record deleted.");
      fetchData();
    } catch (err) {
      error("Failed to delete sacrament record.");
    }
  };

  const handleViewSacrament = (sacrament) => {
    success(
      `View functionality for ${sacrament.parishionerName}'s ${sacrament.type} record`
    );
  };

  const countByType = (type) =>
    sacraments.filter((s) => s.type === type).length;

  const sacramentColumns = [
    { key: "parishionerName", header: "Parishioner Name" },
    { key: "priestName", header: "Priest Name" },
    {
      key: "type",
      header: "Sacrament Type",
      render: (value) => (
        <Badge
          variant="outline"
          className={`${
            value === "BAPTISM"
              ? "border-blue-300 text-blue-700"
              : value === "FIRST_COMMUNION"
              ? "border-green-300 text-green-700"
              : value === "CONFIRMATION"
              ? "border-purple-300 text-purple-700"
              : value === "MARRIAGE"
              ? "border-red-300 text-red-700"
              : "border-gray-300 text-gray-700"
          }`}
        >
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1 text-amber-700" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Sacrament Records
          </h2>
          <p className="text-amber-700">
            Manage all sacrament records for parishioners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Baptisms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByType("BAPTISM")}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">First Communions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {countByType("FIRST_COMMUNION")}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Confirmations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {countByType("CONFIRMATION")}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Marriages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByType("MARRIAGE")}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sacraments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  Sacrament Records
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Complete record of all sacraments administered in the parish
                </CardDescription>
              </div>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Record
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing && (
              <div className="mb-6 p-4 border border-amber-300 rounded bg-amber-50">
                <h3 className="text-amber-900 text-lg mb-3">Edit Sacrament</h3>
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Type</label>
                  <select
                    value={editData.type}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, type: e.target.value }))
                    }
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
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Priest</label>
                  <select
                    value={editData.priestName}
                    onChange={(e) => {
                      const selected = priests.find(
                        (p) => p.name === e.target.value
                      );
                      setEditData((prev) => ({
                        ...prev,
                        priestId: selected?.id || "",
                        priestName: selected?.name || "",
                      }));
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
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <DataTable
              data={sacraments}
              columns={sacramentColumns}
              searchPlaceholder="Search by parishioner name, sacrament type, or priest..."
              onEdit={handleEditSacrament}
              onView={handleViewSacrament}
              onDelete={handleDeleteSacrament}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SacramentRecords;
