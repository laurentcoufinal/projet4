import { GetCurrentUserUseCase } from './application/use-cases/auth/GetCurrentUserUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { RegisterUserUseCase } from './application/use-cases/auth/RegisterUserUseCase';
import { DeleteFileUseCase } from './application/use-cases/files/DeleteFileUseCase';
import { DownloadFileUseCase } from './application/use-cases/files/DownloadFileUseCase';
import { ListFilesUseCase } from './application/use-cases/files/ListFilesUseCase';
import { UploadFileUseCase } from './application/use-cases/files/UploadFileUseCase';
import { CreateShareLinkUseCase } from './application/use-cases/share/CreateShareLinkUseCase';
import { DownloadByTokenUseCase } from './application/use-cases/share/DownloadByTokenUseCase';
import { ShareFileUseCase } from './application/use-cases/share/ShareFileUseCase';
import { UnshareFileUseCase } from './application/use-cases/share/UnshareFileUseCase';
import { env } from './shared/config/env';
import { MongoFileRepository } from './infrastructure/repositories/MongoFileRepository';
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher';
import { JwtTokenService } from './infrastructure/security/JwtTokenService';
import { LocalFileStorage } from './infrastructure/storage/LocalFileStorage';

export function buildContainer() {
  const userRepository = new MongoUserRepository();
  const fileRepository = new MongoFileRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(
    env.jwtSecret,
    env.jwtExpiresIn as import('jsonwebtoken').SignOptions['expiresIn']
  );
  const fileStorage = new LocalFileStorage(env.uploadDir);

  return {
    tokenService,
    useCases: {
      registerUser: new RegisterUserUseCase(userRepository, passwordHasher, tokenService),
      login: new LoginUseCase(userRepository, passwordHasher, tokenService),
      getCurrentUser: new GetCurrentUserUseCase(userRepository),
      uploadFile: new UploadFileUseCase(fileRepository, fileStorage, passwordHasher),
      listFiles: new ListFilesUseCase(fileRepository),
      downloadFile: new DownloadFileUseCase(fileRepository, fileStorage, passwordHasher),
      deleteFile: new DeleteFileUseCase(fileRepository, fileStorage),
      shareFile: new ShareFileUseCase(fileRepository, userRepository),
      unshareFile: new UnshareFileUseCase(fileRepository),
      createShareLink: new CreateShareLinkUseCase(fileRepository),
      downloadByToken: new DownloadByTokenUseCase(fileRepository, fileStorage),
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
