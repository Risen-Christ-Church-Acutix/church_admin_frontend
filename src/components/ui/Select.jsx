"use client"

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

const SelectContent = ({ children }) => children
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>
const SelectTrigger = ({ children, className = "" }) => <div className={className}>{children}</div>
const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
