import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';

export function setupSwagger(app: NestExpressApplication) {
  app.useStaticAssets(join(__dirname, 'assets'), {
    prefix: '/api-docs-assets/',
    index: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Anvy EBR API')
    .setDescription(
      'Tài liệu API cho ứng dụng Hồ sơ lô điện tử Anvy. Đăng nhập qua POST /auth/login, sau đó dùng accessToken tại nút Authorize để thử các API cần xác thực.',
    )
    .setVersion('1.0.0')
    .addServer(process.env.SWAGGER_API_URL?.trim() || '/')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  SwaggerModule.setup(
    'api-docs',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      customSiteTitle: 'Anvy EBR | API Reference',
      customfavIcon: '/api-docs-assets/favicon.png',
      customCss: `
        .swagger-ui .topbar {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .topbar .link {
          gap: .75rem;
          color: #166534;
          font-size: 1.15rem;
          font-weight: 600;
        }
        .swagger-ui .topbar .link img {
          width: 40px;
          height: 48px;
          object-fit: contain;
        }
      `,
      customJsStr: `
        (() => {
          function brandTopbar() {
            const link = document.querySelector('.swagger-ui .topbar .link');
            if (!link) return;
            observer.disconnect();
            const logo = document.createElement('img');
            logo.src = '/api-docs-assets/logo.png';
            logo.alt = 'Logo Anvy';
            const label = document.createElement('span');
            label.textContent = 'Anvy EBR API';
            link.replaceChildren(logo, label);
            link.href = '/api-docs';
            link.removeAttribute('target');
          }
          const observer = new MutationObserver(brandTopbar);
          observer.observe(document.documentElement, { childList: true, subtree: true });
          brandTopbar();
        })();
      `,
      jsonDocumentUrl: 'api-docs-json',
      yamlDocumentUrl: 'api-docs-yaml',
      swaggerOptions: {
        persistAuthorization: true,
        deepLinking: true,
        filter: true,
      },
    },
  );
}
