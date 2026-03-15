export interface FileShare {
  id: string;
  fileId: string;
  userId: string;
  permission: 'read';
  createdAt: Date;
  updatedAt: Date;
}
