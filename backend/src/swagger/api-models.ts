import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({ minLength: 2, maxLength: 50 })
  username!: string;

  @ApiProperty({
    format: 'password',
    minLength: 6,
    maxLength: 50,
    writeOnly: true,
  })
  password!: string;
}

export class LoginResponse {
  @ApiProperty({ description: 'JWT dùng để xác thực các yêu cầu tiếp theo.' })
  accessToken!: string;
}

export class SessionUserResponse {
  @ApiProperty()
  username!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ type: String, format: 'email', nullable: true })
  email!: string | null;

  @ApiProperty({ type: String, nullable: true })
  position!: string | null;

  @ApiProperty()
  department!: string;

  @ApiProperty({ type: String, format: 'uri', nullable: true })
  avatar!: string | null;
}

export class ChangePasswordRequest {
  @ApiProperty({
    format: 'password',
    minLength: 6,
    maxLength: 50,
    writeOnly: true,
  })
  currentPassword!: string;

  @ApiProperty({
    format: 'password',
    minLength: 8,
    maxLength: 50,
    writeOnly: true,
    description:
      'Tối đa 72 byte. Phải khác mật khẩu hiện tại và có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.',
  })
  newPassword!: string;
}

export class ItemRequest {
  @ApiProperty({
    minLength: 1,
    maxLength: 191,
    description: 'Mã hàng duy nhất.',
  })
  item_code!: string;

  @ApiProperty({ minLength: 1, maxLength: 1000 })
  item_name!: string;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 191 })
  unit?: string | null;
}

export class ItemResponse extends ItemRequest {
  @ApiProperty({ minimum: 1, type: 'integer' })
  id!: number;

  @ApiProperty({ type: String, nullable: true, maxLength: 191, required: true })
  declare unit: string | null;
}

export class ItemListResponse {
  @ApiProperty({ type: [ItemResponse] })
  items!: ItemResponse[];

  @ApiProperty()
  hasMore!: boolean;
}
