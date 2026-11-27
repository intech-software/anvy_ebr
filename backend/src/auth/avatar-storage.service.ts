import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const avatarFolder = 'anvy/avt';
const acceptedFormats = new Set(['jpeg', 'png', 'webp']);
export const maxAvatarBytes = 20 * 1024 * 1024;

@Injectable()
export class AvatarStorage {
  private readonly logger = new Logger(AvatarStorage.name);
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const cloud_name = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = config.get<string>('CLOUDINARY_API_SECRET');
    this.configured = Boolean(cloud_name && api_key && api_secret);
    if (this.configured) {
      cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    }
  }

  async upload(file: Express.Multer.File) {
    if (!this.configured) {
      throw new ServiceUnavailableException('Avatar storage is not configured');
    }

    const image = await this.normalize(file.buffer);
    const filename = randomUUID();
    const publicId = `${avatarFolder}/${filename}`;
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: avatarFolder,
            public_id: filename,
            resource_type: 'image',
            overwrite: false,
            timeout: 15000,
          },
          (error, response) => {
            if (error || !response) {
              this.logger.warn(
                `Cloudinary avatar upload failed (status ${error?.http_code ?? 'unknown'})`,
              );
              reject(new BadGatewayException('Could not upload avatar'));
              return;
            }
            resolve(response);
          },
        )
        .on('error', () =>
          reject(new BadGatewayException('Could not upload avatar')),
        )
        .end(image);
    });

    if (result.public_id !== publicId || !result.secure_url) {
      await this.remove(result.public_id);
      throw new BadGatewayException('Invalid avatar upload result');
    }

    return { avatar: result.secure_url, avatar_public_id: publicId };
  }

  async remove(publicId: string | null) {
    if (!publicId || !publicId.startsWith(`${avatarFolder}/`)) return;

    try {
      const options = { invalidate: true, timeout: 10000 };
      await cloudinary.uploader.destroy(publicId, options);
    } catch {
      this.logger.warn(`Could not remove avatar ${publicId}`);
    }
  }

  private async normalize(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer, { limitInputPixels: 25_000_000 });
      const { format } = await image.metadata();
      if (!format || !acceptedFormats.has(format)) {
        throw new Error('Unsupported image format');
      }
      return await image
        .rotate()
        .resize(256, 256, { fit: 'cover', position: sharp.strategy.attention })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Invalid JPG, PNG or WebP image');
    }
  }
}
