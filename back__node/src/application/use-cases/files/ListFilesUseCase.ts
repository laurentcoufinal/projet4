import type { FileRepository } from '../../../domain/ports/FileRepository';
import { toFileListItemDto } from '../../dto/FileDtos';

export class ListFilesUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(userId: string): Promise<{ data: ReturnType<typeof toFileListItemDto>[] }> {
    const items = await this.fileRepository.listVisibleByUser(userId);
    return { data: items.map(toFileListItemDto) };
  }
}
