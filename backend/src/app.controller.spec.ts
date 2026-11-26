import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports that the backend is running', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    expect(module.get(AppController).getStatus()).toEqual({ status: 'ok' });
    await module.close();
  });
});
