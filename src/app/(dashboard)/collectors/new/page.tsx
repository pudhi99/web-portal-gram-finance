import { CollectorForm } from '@/components/collectors/CollectorForm';

export default function NewCollectorPage() {
  return (
    <div className="container mx-auto py-10">
      <CollectorForm isEditing={false} />
    </div>
  );
} 