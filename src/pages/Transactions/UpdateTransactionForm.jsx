
"use client";

import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { useToaster } from "../../components/Toaster";
import axiosInstance from "../../api-handler/api-handler";

const UpdateTransactionForm = ({ onClose, onSuccess, transaction = null }) => {
  const { success, error } = useToaster();
  const isEditMode = !!transaction;

  // Initialize form state with transaction data if in edit mode
  const [formData, setFormData] = useState({
    amount: transaction?.amount || "",
    type: transaction?.transactionType || "",
    description: transaction?.description || "",
    category: transaction?.category || "",
    receiptUrl: transaction?.receiptUrl || "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: transaction?.id, // Include ID only for edit mode
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description,
        category: formData.category,
        receiptUrl: formData.receiptUrl,
      };

      if (isEditMode) {
        // Update transaction
        await axiosInstance.put("/api/transactions/update", payload);
        success(`Transaction #${transaction.sno} updated successfully`);
      } else {
        // Add new transaction
        await axiosInstance.post("/api/transactions", payload);
        success("Transaction added successfully");
      }

      onSuccess(); // Trigger parent to refresh transactions
      onClose(); // Close the form
    } catch (err) {
      error(isEditMode ? "Failed to update transaction" : "Failed to add transaction");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">
          {isEditMode ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
            className="border-amber-300"
          />
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
            required
          >
            <SelectTrigger className="border-amber-300">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
            required
          >
            <SelectTrigger className="border-amber-300">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
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
          <Input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="border-amber-300"
          />
          <Input
            type="text"
            placeholder="Receipt URL (optional)"
            value={formData.receiptUrl}
            onChange={(e) => handleChange("receiptUrl", e.target.value)}
            className="border-amber-300"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-300 text-amber-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isEditMode ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTransactionForm;