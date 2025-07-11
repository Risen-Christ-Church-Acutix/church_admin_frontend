"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import DataTable from "../../components/DataTable";
import Layout from "../../components/Layout";
import { useToaster } from "../../components/Toaster";
import { Plus, Filter, Download, FileText, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";
import UpdateTransactionForm from "./UpdateTransactionForm";
import axiosInstance from "../../api-handler/api-handler";
import GeneratePDFModal from "./GeneratePDF";
import GenerateExcelModal from "./GenerateExcel";

const Transactions = () => {
  const { success, error } = useToaster();
  const [filters, setFilters] = useState({
    transactionType: "",
    category: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    period: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);
  const addFormRef = useRef(null);

  const getDateRangeDisplay = () => {
    if (!filters.dateFrom && !filters.dateTo && !filters.period) return "All dates";
    if (filters.period) {
      const today = new Date();
      let dateFrom = new Date(today);
      if (filters.period === "1_MONTH") dateFrom.setMonth(today.getMonth() - 1);
      else if (filters.period === "3_MONTHS") dateFrom.setMonth(today.getMonth() - 3);
      else if (filters.period === "6_MONTHS") dateFrom.setMonth(today.getMonth() - 6);
      else if (filters.period === "12_MONTHS") dateFrom.setFullYear(today.getFullYear() - 1);
      return `${dateFrom.toLocaleDateString()} to ${today.toLocaleDateString()}`;
    }
    const from = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Start";
    const to = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "End";
    return `${from} to ${to}`;
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const response = await axiosInstance.get("/api/transactions/all");
      const sortedTransactions = response.data.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const mappedTransactions = sortedTransactions.map((t, index) => ({
        id: t.id,
        sno: index + 1,
        amount: t.amount,
        description: t.description || "no description",
        datetime: t.createdAt || new Date().toISOString(),
        eventId: t.eventId || null,
        transactionType: t.type,
        category: t.category,
        customCategory: t.customCategory || null,
      }));
      setTransactions(mappedTransactions);
    } catch (err) {
      setHasError(true);
      error("Failed to fetch transactions. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setShouldFetch(false);
    }
  }, [error]);

  useEffect(() => {
    if (shouldFetch) {
      fetchTransactions();
    }
  }, [shouldFetch, fetchTransactions]);

  const handleRetry = () => {
    setShouldFetch(true);
  };

  const transactionColumns = [
    { key: "sno", header: "S.No", className: "w-16" },
    {
      key: "amount",
      header: "Amount",
      render: (value, item) => (
        <div
          className={`flex items-center font-semibold ${
            item.transactionType === "INCOME" ? "text-green-600" : "text-red-600"
          }`}
        >
          ₹{value.toFixed(2)}
        </div>
      ),
    },
    { key: "description", header: "Description" },
    {
      key: "datetime",
      header: "Date & Time",
      render: (value) => (
        <div className="flex items-center text-sm">
          <Calendar className="w-3 h-3 mr-1 text-amber-700" />
          {new Date(value).toLocaleDateString()}{" "}
          {new Date(value).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      key: "transactionType",
      header: "Type",
      render: (value) => (
        <Badge
          variant="outline"
          className={value === "INCOME" ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}
        >
          <div className="flex items-center">
            {value === "INCOME" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {value}
          </div>
        </Badge>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (value) => (
        <Badge variant="outline" className="border-amber-300 text-amber-700">
          {value.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === "period" && value) {
        const today = new Date();
        let dateFrom = new Date(today);

        if (value === "1_MONTH") {
          dateFrom.setMonth(today.getMonth() - 1);
        } else if (value === "3_MONTHS") {
          dateFrom.setMonth(today.getMonth() - 3);
        } else if (value === "6_MONTHS") {
          dateFrom.setMonth(today.getMonth() - 6);
        } else if (value === "12_MONTHS") {
          dateFrom.setFullYear(today.getFullYear() - 1);
        }

        newFilters.dateFrom = dateFrom.toISOString().split("T")[0];
        newFilters.dateTo = today.toISOString().split("T")[0];
      }
      
      if (key === "dateFrom" || key === "dateTo") {
        newFilters.period = "";
      }

      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      transactionType: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      period: "",
    });
    setShowAdvancedFilters(false);
  };

  const applyFilters = () => {
    // Trigger filter application (already handled by filteredTransactions)
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    if (window.confirm(`Are you sure you want to delete transaction #${transaction.sno}?`)) {
      try {
        await axiosInstance.delete(`/api/transactions/delete`, {
          data: { id: transaction.id },
        });
        setShouldFetch(true);
        success(`Transaction #${transaction.sno} has been deleted successfully.`);
      } catch (err) {
        console.error("Error deleting transaction:", err.message, err.response?.data);
        error("Failed to delete transaction");
      }
    }
  };

  const handleAddTransactionSuccess = useCallback(() => {
    setShouldFetch(true);
  }, []);

  const handleAddButtonClick = () => {
    setSelectedTransaction(null);
    setShowForm(true);
    setTimeout(() => {
      if (addFormRef.current) {
        addFormRef.current.focusForm();
      }
    }, 0);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    let matches = true;

    if (filters.transactionType && transaction.transactionType !== filters.transactionType) {
      matches = false;
    }

    if (filters.category && transaction.category !== filters.category) {
      matches = false;
    }

    if (filters.dateFrom) {
      const transactionDate = new Date(transaction.datetime).setHours(0, 0, 0, 0);
      const fromDate = new Date(filters.dateFrom).setHours(0, 0, 0, 0);
      if (transactionDate < fromDate) matches = false;
    }

    if (filters.dateTo) {
      const transactionDate = new Date(transaction.datetime).setHours(0, 0, 0, 0);
      const toDate = new Date(filters.dateTo).setHours(23, 59, 59, 999);
      if (transactionDate > toDate) matches = false;
    }

    if (filters.amountMin && transaction.amount < parseFloat(filters.amountMin)) {
      matches = false;
    }

    if (filters.amountMax && transaction.amount > parseFloat(filters.amountMax)) {
      matches = false;
    }

    return matches;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transactionType === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">Transaction Records</h2>
          <p className="text-amber-700">Manage all financial transactions and generate reports</p>
        </div>

        {isLoading && (
          <div className="text-center text-amber-700">Loading transactions...</div>
        )}

        {hasError && !isLoading && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-red-700 mb-4">Failed to load transactions. Please try again.</p>
              <Button
                onClick={handleRetry}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !hasError && showForm && (
          <>
            {selectedTransaction ? (
              <UpdateTransactionForm
                onClose={() => {
                  setShowForm(false);
                  setSelectedTransaction(null);
                }}
                onSuccess={handleAddTransactionSuccess}
                transaction={selectedTransaction}
              />
            ) : (
              <AddTransactionForm
                ref={addFormRef}
                onClose={() => setShowForm(false)}
                onSuccess={handleAddTransactionSuccess}
              />
            )}
          </>
        )}

        {!isLoading && !hasError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Total Income</span>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">₹{totalIncome.toFixed(2)}</div>
                  <p className="text-green-100 text-sm">This period</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Total Expenses</span>
                    <TrendingDown className="w-8 h-8 opacity-80" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">₹{totalExpense.toFixed(2)}</div>
                  <p className="text-red-100 text-sm">This period</p>
                </CardContent>
              </Card>

              <Card
                className={`bg-gradient-to-br ${netBalance >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} text-white border-0 shadow-lg`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Net Balance</span>
                    <span className="text-3xl opacity-80">₹</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">₹{netBalance.toFixed(2)}</div>
                  <p className={`${netBalance >= 0 ? "text-blue-100" : "text-orange-100"} text-sm`}>
                    {netBalance >= 0 ? "Surplus" : "Deficit"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-6">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-amber-900 text-xl">Filters</CardTitle>
                    <CardDescription className="text-amber-700">
                      Refine the transaction records list | Date Range: {getDateRangeDisplay()}
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
                      <label className="block text-amber-700 mb-1">Transaction Type</label>
                      <Select
                        value={filters.transactionType}
                        onValueChange={(value) => handleFilterChange("transactionType", value)}
                      >
                        <SelectTrigger className="border-amber-300">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="INCOME">Income</SelectItem>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-amber-700 mb-1">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                      >
                        <SelectTrigger className="border-amber-300">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          <SelectItem value="SUNDAY_COLLECTION">Sunday Collection</SelectItem>
                          <SelectItem value="DONATION">Donation</SelectItem>
                          <SelectItem value="SUBSCRIPTION_FEES">Subscription Fees</SelectItem>
                          <SelectItem value="EVENT_REGISTRATION">Event Registration</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="SALARY">Salary</SelectItem>
                          <SelectItem value="EVENT_EXPENSE">Event Expense</SelectItem>
                          <SelectItem value="CHARITY">Charity</SelectItem>
                          <SelectItem value="DUMPBOX">Dumpbox</SelectItem>
                          <SelectItem value="SUNDAY_OFFERING">Sunday Offering</SelectItem>
                          <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-amber-700 mb-1">Period</label>
                      <Select
                        value={filters.period}
                        onValueChange={(value) => handleFilterChange("period", value)}
                      >
                        <SelectTrigger className="border-amber-300">
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Custom Period</SelectItem>
                          <SelectItem value="1_MONTH">Last 1 Month</SelectItem>
                          <SelectItem value="3_MONTHS">Last 3 Months</SelectItem>
                          <SelectItem value="6_MONTHS">Last 6 Months</SelectItem>
                          <SelectItem value="12_MONTHS">Last 12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {!filters.period && (
                      <>
                        <div>
                          <label className="block text-amber-700 mb-1">Start Date</label>
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                            className="border-amber-300 focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-amber-700 mb-1">End Date</label>
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                            className="border-amber-300 focus:border-amber-500"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-amber-700 mb-1">Min Amount</label>
                      <Input
                        type="number"
                        value={filters.amountMin}
                        onChange={(e) => handleFilterChange("amountMin", e.target.value)}
                        placeholder="Min Amount"
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-700 mb-1">Max Amount</label>
                      <Input
                        type="number"
                        value={filters.amountMax}
                        onChange={(e) => handleFilterChange("amountMax", e.target.value)}
                        placeholder="Max Amount"
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>
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
                    <GeneratePDFModal
                      transactions={filteredTransactions}
                      buttonContent={
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate PDF
                        </>
                      }
                      buttonClassName="border-red-300 text-red-700 hover:bg-red-50"
                      type="button"
                    />
                    <GenerateExcelModal
                      transactions={filteredTransactions}
                      filters={filters}
                      buttonContent={
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate Excel
                        </>
                      }
                      buttonClassName="border-green-300 text-green-700 hover:bg-green-50"
                      type="button"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-amber-900 text-xl">Transaction Records</CardTitle>
                    <CardDescription className="text-amber-700">
                      Complete record of all financial transactions
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAddButtonClick}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Transaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center text-amber-600">
                    No records match the selected filters.
                  </div>
                ) : (
                  <DataTable
                    data={filteredTransactions}
                    columns={transactionColumns}
                    searchPlaceholder="Search by description, amount, or category..."
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;