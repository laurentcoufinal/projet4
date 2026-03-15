import { describe, expect, it, vi } from 'vitest';
import { ListFilesUseCase } from '../../../../../src/application/use-cases/files/ListFilesUseCase';

describe('ListFilesUseCase', () => {
  it('retourne data array depuis le repository', async () => {
    const fileRepo = { listVisibleByUser: vi.fn().mockResolvedValue([]) };
    const useCase = new ListFilesUseCase(fileRepo as any);

    const result = await useCase.execute('u1');
    expect(result.data).toEqual([]);
    expect(fileRepo.listVisibleByUser).toHaveBeenCalledWith('u1');
  });
});
