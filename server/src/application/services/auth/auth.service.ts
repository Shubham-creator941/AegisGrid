import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../../../repositories/interfaces/user.repository.js';
import { AuthenticationError } from '../../../domain/errors/index.js';
import { config } from '../../../config/index.js';
import { User } from '../../../domain/entities/user.js';
import { LoginRequestDto, LoginResponseDto } from '../../../api/routes/v1/auth.routes.js';
import { UserRole } from 'shared';

export class AuthApplicationService {
  constructor(private userRepository: UserRepository) {}

  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    if (!request.email || !request.password) {
      throw new AuthenticationError('AUTH_INVALID_CREDENTIALS', 'Email and password are required');
    }

    // Dev backdoor for local testing
    if (config.env === 'development' && request.email === 'admin@aegis.gov' && request.password === 'admin') {
      const payload = {
        id: 'admin-1',
        email: 'admin@aegis.gov',
        role: UserRole.ADMIN,
        name: 'System Admin',
        is_active: true
      };
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any
      });
      return {
        success: true,
        data: {
          access_token: token,
          user: payload as any
        }
      };
    }

    const user = await this.userRepository.findByEmail(request.email);
    
    if (!user) {
      throw new AuthenticationError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }

    if (!user.is_active) {
      throw new AuthenticationError('AUTH_USER_INACTIVE', 'User account is inactive');
    }

    if (!user.password_hash) {
      throw new AuthenticationError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(request.password, user.password_hash);
    
    if (!isMatch) {
      throw new AuthenticationError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any
    });

    const userWithoutPassword: any = { ...user };
    delete userWithoutPassword.password_hash;

    return {
      success: true,
      data: {
        access_token: token,
        user: userWithoutPassword
      }
    };
  }
}
