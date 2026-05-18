import { userRepository } from "../repositories/user.repository.js";
import { NotFoundError } from "../utils/errors.js";
import { UserResponseDTO, UpdateUserDTO } from "../dto/auth.dto.js";
import { IUser } from "../types/models.js";

export class UserService {
  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.mapUserToDTO(user);
  }

  async getAllUsers(page: number, limit: number): Promise<{ users: UserResponseDTO[]; total: number }> {
    const offset = (page - 1) * limit;
    const { users, total } = await userRepository.findAll(offset, limit);

    return {
      users: users.map(user => this.mapUserToDTO(user)),
      total
    };
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await userRepository.update(id, updates);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return this.mapUserToDTO(updatedUser);
  }

  async searchUsers(queryText: string, limit: number): Promise<{ users: UserResponseDTO[] }> {
    const users = await userRepository.searchByEmailOrUsername(queryText, limit);
    return { users: users.map(user => this.mapUserToDTO(user)) };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.delete(id);
  }

  private mapUserToDTO(user: IUser): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}

export const userService = new UserService();
