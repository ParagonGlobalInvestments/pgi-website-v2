import { FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { getFileType } from '@/lib/utils/fileHelpers';

interface FileTypeIconProps {
  filePath: string;
  className?: string;
  showLabel?: boolean;
}

export function FileTypeIcon({
  filePath,
  className = 'h-5 w-5',
  showLabel = false,
}: FileTypeIconProps) {
  const fileType = getFileType(filePath);

  const iconMap = {
    pdf: { Icon: FileText, label: 'PDF', color: 'text-red-600' },
    excel: { Icon: FileSpreadsheet, label: 'Excel', color: 'text-green-600' },
    word: { Icon: FileType, label: 'Word', color: 'text-blue-600' },
    other: { Icon: FileText, label: 'File', color: 'text-gray-600' },
  };

  const { Icon, label, color } = iconMap[fileType];

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`${className} ${color}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    );
  }

  return <Icon className={`${className} ${color}`} />;
}
