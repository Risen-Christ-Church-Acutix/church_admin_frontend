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
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import DataTable from "../components/DataTable";
import Layout from "../components/Layout";
import { useToaster } from "../components/Toaster";
import { Plus, Calendar, Filter } from "lucide-react";
import axiosInstance from "../api-handler/api-handler";

const SacramentRecords = () => {
  const { success, error } = useToaster();
  const [sacraments, setSacraments] = useState([]);
  const [filteredSacraments, setFilteredSacraments] = useState([]);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priests, setPriests] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    priestId: "",
    startDate: "",
    endDate: "",
    parishionerName: "",
  });

  useEffect(() => {
    fetchData();
    fetchPriests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sacraments, filters]);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/api/sacraments/");
      const transformedData = res.data.map((s) => ({
        id: s.id,
        type: s.type,
        parishionerName: s.parishioner?.name || "N/A",
        parishionerId: s.parishioner?.id || "",
        date: s.date,
        priestId: s.priest?.id || "",
        priestName: s.priest?.name || "N/A",
      }));
      console.log("Fetched sacraments with priestIds:", transformedData);
      setSacraments(transformedData);
      setFilteredSacraments(transformedData);
    } catch (err) {
      error("Failed to fetch sacrament records.");
    }
  };

  const fetchPriests = async () => {
    try {
      const res = await axiosInstance.get("/api/parishioners/getPriests");
      setPriests(res.data);
      console.log(
        "Fetched priests with IDs:",
        res.data.map((p) => ({ id: p.id, name: p.name }))
      );
    } catch (err) {
      error("Failed to fetch priests.");
    }
  };

  const getDateRangeDisplay = () => {
    if (!filters.startDate && !filters.endDate) return "All dates";
    const from = filters.startDate
      ? new Date(filters.startDate).toLocaleDateString()
      : "Start";
    const to = filters.endDate
      ? new Date(filters.endDate).toLocaleDateString()
      : "End";
    return `${from} to ${to}`;
  };

  const applyFilters = () => {
    let result = [...sacraments];

    if (filters.type) {
      result = result.filter((s) => s.type === filters.type);
    }

    if (filters.priestId) {
      result = result.filter(
        (s) => String(s.priestId) === String(filters.priestId)
      );
    }

    if (filters.startDate) {
      result = result.filter(
        (s) => new Date(s.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      result = result.filter(
        (s) => new Date(s.date) <= new Date(filters.endDate)
      );
    }

    if (filters.parishionerName) {
      result = result.filter((s) =>
        s.parishionerName
          .toLowerCase()
          .includes(filters.parishionerName.toLowerCase())
      );
    }

    console.log("Filtered sacraments:", result);
    setFilteredSacraments(result);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      priestId: "",
      startDate: "",
      endDate: "",
      parishionerName: "",
    });
    setShowAdvancedFilters(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditSacrament = (sacrament) => {
    setEditData({
      id: sacrament.id,
      type: sacrament.type,
      date: sacrament.date,
      priestId: sacrament.priestId,
      priestName: sacrament.priestName,
      parishionerId: sacrament.parishionerId,
    });
    console.log(editData);
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post(`/api/sacraments/update/${editData.id}`, {
        type: editData.type,
        priest: {
          id: editData.priestId,
        },
        date:editData.date,
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
    filteredSacraments.filter((s) => s.type === type).length;

  // List of all possible sacraments
  const allSacraments = [
    { value: "BAPTISM", label: "Baptism" },
    { value: "FIRST_COMMUNION", label: "First Communion" },
    { value: "CONFIRMATION", label: "Confirmation" },
    { value: "MARRIAGE", label: "Marriage" },
    { value: "FUNERAL", label: "Funeral" },
  ];

  // Filter out sacraments already completed by the parishioner
  const availableSacraments = allSacraments.filter(
    (sacrament) =>
      !sacraments.some(
        (s) =>
          s.parishionerId === editData.parishionerId &&
          s.type === sacrament.value &&
          s.id !== editData.id
      )
  );

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
        <div className="flex items-center text-black text-sm">
          <Calendar className="w-3 h-3 mr-1 text-black" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Baptisms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {countByType("BAPTISM")}
              </div>
              <p className="text-blue-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>First Communions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {countByType("FIRST_COMMUNION")}
              </div>
              <p className="text-green-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Confirmations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {countByType("CONFIRMATION")}
              </div>
              <p className="text-purple-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Marriages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {countByType("MARRIAGE")}
              </div>
              <p className="text-red-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-600 to-gray-800 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Funerals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {countByType("FUNERAL")}
              </div>
              <p className="text-gray-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Total Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {filteredSacraments.length}
              </div>
              <p className="text-gray-100 text-sm">Total recorded</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-6">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  Filters
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Refine the sacrament records list | Date Range:{" "}
                  {getDateRangeDisplay()}
                </CardDescription>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </CardHeader>
          {showAdvancedFilters && (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-amber-700 mb-1">
                    Sacrament Type
                  </label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger className="border-amber-300 focus:border-amber-500">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {allSacraments.map((sacrament) => (
                        <SelectItem
                          key={sacrament.value}
                          value={sacrament.value}
                        >
                          {sacrament.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-amber-700 mb-1">Priest</label>
                  <Select
                    value={filters.priestId}
                    onValueChange={(value) =>
                      handleFilterChange("priestId", value)
                    }
                  >
                    <SelectTrigger className="border-amber-300 focus:border-amber-500">
                      <SelectValue placeholder="All Priests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priests</SelectItem>
                      {priests.map((priest) => (
                        <SelectItem key={priest.id} value={String(priest.id)}>
                          {priest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-amber-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="border-amber-300 focus:border-amber-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-amber-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="border-amber-300 focus:border-amber-500 text-black"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-amber-700 mb-1">
                  Parishioner Name
                </label>
                <Input
                  type="text"
                  value={filters.parishionerName}
                  onChange={(e) =>
                    handleFilterChange("parishionerName", e.target.value)
                  }
                  placeholder="Enter parishioner name"
                  className="border-amber-300 focus:border-amber-500 text-black"
                />
              </div>
              <div className="flex space-x-4 mt-6">
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

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
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing && (
              <div className="mb-6 p-4 border border-amber-300 rounded bg-amber-50">
                <h3 className="text-amber-900 text-lg mb-3">Edit Sacrament</h3>

                {/* Sacrament Type */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Type</label>
                  <Select
                    value={editData.type}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-[330px] border-amber-300 focus:border-amber-500">
                      <SelectValue placeholder="Select sacrament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select sacrament</SelectItem>
                      {availableSacraments.map((sacrament) => (
                        <SelectItem
                          key={sacrament.value}
                          value={sacrament.value}
                        >
                          {sacrament.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priest Selection */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Priest</label>
                  <Select
                    value={editData.priestName}
                    onValueChange={(value) => {
                      const selected = priests.find((p) => p.name === value);
                      setEditData((prev) => ({
                        ...prev,
                        priestId: selected?.id || "",
                        priestName: selected?.name || "",
                      }));
                    }}
                  >
                    <SelectTrigger className="w-[330px] border-amber-300 focus:border-amber-500">
                      <SelectValue placeholder="Select priest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select priest</SelectItem>
                      {priests.map((priest) => (
                        <SelectItem key={priest.id} value={priest.name}>
                          {priest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Input */}
                <div className="mb-3">
                  <label className="block text-amber-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-[330px] border border-amber-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                    value={
                      editData.date
                        ? new Date(editData.date).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        date: new Date(e.target.value).toISOString(),
                      }))
                    }
                  />
                </div>

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
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {filteredSacraments.length === 0 ? (
              <div className="text-center text-amber-600">
                No records match the selected filters.
              </div>
            ) : (
              <DataTable
                data={filteredSacraments}
                columns={sacramentColumns}
                searchPlaceholder="Search by parishioner name, sacrament type, or priest..."
                onEdit={handleEditSacrament}
                onView={handleViewSacrament}
                onDelete={handleDeleteSacrament}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SacramentRecords;
