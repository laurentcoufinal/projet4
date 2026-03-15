"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContainer = buildContainer;
const GetCurrentUserUseCase_1 = require("./application/use-cases/auth/GetCurrentUserUseCase");
const LoginUseCase_1 = require("./application/use-cases/auth/LoginUseCase");
const RegisterUserUseCase_1 = require("./application/use-cases/auth/RegisterUserUseCase");
const DeleteFileUseCase_1 = require("./application/use-cases/files/DeleteFileUseCase");
const DownloadFileUseCase_1 = require("./application/use-cases/files/DownloadFileUseCase");
const ListFilesUseCase_1 = require("./application/use-cases/files/ListFilesUseCase");
const UploadFileUseCase_1 = require("./application/use-cases/files/UploadFileUseCase");
const CreateShareLinkUseCase_1 = require("./application/use-cases/share/CreateShareLinkUseCase");
const DownloadByTokenUseCase_1 = require("./application/use-cases/share/DownloadByTokenUseCase");
const ShareFileUseCase_1 = require("./application/use-cases/share/ShareFileUseCase");
const UnshareFileUseCase_1 = require("./application/use-cases/share/UnshareFileUseCase");
const env_1 = require("./shared/config/env");
const MongoFileRepository_1 = require("./infrastructure/repositories/MongoFileRepository");
const MongoUserRepository_1 = require("./infrastructure/repositories/MongoUserRepository");
const BcryptPasswordHasher_1 = require("./infrastructure/security/BcryptPasswordHasher");
const JwtTokenService_1 = require("./infrastructure/security/JwtTokenService");
const LocalFileStorage_1 = require("./infrastructure/storage/LocalFileStorage");
function buildContainer() {
    const userRepository = new MongoUserRepository_1.MongoUserRepository();
    const fileRepository = new MongoFileRepository_1.MongoFileRepository();
    const passwordHasher = new BcryptPasswordHasher_1.BcryptPasswordHasher();
    const tokenService = new JwtTokenService_1.JwtTokenService(env_1.env.jwtSecret, env_1.env.jwtExpiresIn);
    const fileStorage = new LocalFileStorage_1.LocalFileStorage(env_1.env.uploadDir);
    return {
        tokenService,
        useCases: {
            registerUser: new RegisterUserUseCase_1.RegisterUserUseCase(userRepository, passwordHasher, tokenService),
            login: new LoginUseCase_1.LoginUseCase(userRepository, passwordHasher, tokenService),
            getCurrentUser: new GetCurrentUserUseCase_1.GetCurrentUserUseCase(userRepository),
            uploadFile: new UploadFileUseCase_1.UploadFileUseCase(fileRepository, fileStorage, passwordHasher),
            listFiles: new ListFilesUseCase_1.ListFilesUseCase(fileRepository),
            downloadFile: new DownloadFileUseCase_1.DownloadFileUseCase(fileRepository, fileStorage, passwordHasher),
            deleteFile: new DeleteFileUseCase_1.DeleteFileUseCase(fileRepository, fileStorage),
            shareFile: new ShareFileUseCase_1.ShareFileUseCase(fileRepository, userRepository),
            unshareFile: new UnshareFileUseCase_1.UnshareFileUseCase(fileRepository),
            createShareLink: new CreateShareLinkUseCase_1.CreateShareLinkUseCase(fileRepository),
            downloadByToken: new DownloadByTokenUseCase_1.DownloadByTokenUseCase(fileRepository, fileStorage),
        },
    };
}
