"use client"

import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Search, Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

const DataTable = ({
  data = [],
  columns = [],
  searchPlaceholder = "Search...",
  onEdit,
  onView,
  onDelete,
  customAction, // New prop for custom action
  showActions = true,
  showSearch = true,
  showPagination = true,
  itemsPerPage = 10,
  className = "",
  emptyMessage = "No data found"
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    columns.some((column) => {
      const value = item[column.key]
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    }),
  )

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Helper function to get alignment class
  const getAlignmentClass = (align) => {
    switch (align) {
      case "left": return "text-left";
      case "right": return "text-right";
      case "center": return "text-center";
      default: return "text-left"; // Default to left align
    }
  }

  const renderCellContent = (item, column, rowIndex) => {
    if (column.render) {
      return column.render(item[column.key], item, rowIndex)
    }
    return item[column.key]
  }

  // Determine if actions column should be shown
  const showActionsColumn = showActions && (onView || onEdit || onDelete || customAction);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar - only show if showSearch is true */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-amber-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50 hover:bg-amber-50">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`text-amber-900 font-semibold px-4 py-3 ${getAlignmentClass(column.align)} ${column.className || ""}`}
                  >
                    {column.header}
                  </th>
                ))}
                {showActionsColumn && <th className="text-amber-900 font-semibold px-4 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-amber-50/50 border-t border-amber-100">
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={`px-4 py-3 text-amber-800 ${getAlignmentClass(column.align)} ${column.cellClassName || ""}`}
                      >
                        {renderCellContent(item, column, index)}
                      </td>
                    ))}
                    {showActionsColumn && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          {customAction && customAction(item)}
                          {onView && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => onView(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={() => onEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (showActionsColumn ? 1 : 0)} className="px-4 py-8 text-center text-amber-600">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - only show if showPagination is true and needed */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-amber-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={
                  currentPage === page
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
