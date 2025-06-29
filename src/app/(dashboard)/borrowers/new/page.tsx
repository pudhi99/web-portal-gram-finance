import { BorrowerForm } from '@/components/borrowers/BorrowerForm'

export default function NewBorrowerPage() {
  return (
    <div className="container mx-auto py-10">
      <BorrowerForm isEditing={false} />
    </div>
  )
} 