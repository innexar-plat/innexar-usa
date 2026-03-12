export interface ProjectListItem {
  id: number;
  name: string;
  status: string;
  progress: number;
  created_at: string;
  expected_delivery: string | null;
  site_url: string | null;
  files_count: number;
  has_files: boolean;
}
