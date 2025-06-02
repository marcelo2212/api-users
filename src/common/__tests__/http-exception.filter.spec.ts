import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  const mockLogger = {
    error: jest.fn(),
  };

  beforeEach(() => {
    filter = new AllExceptionsFilter(mockLogger as any);
  });

  it('deve estar definido', () => {
    expect(filter).toBeDefined();
  });

  it('deve lidar com HttpException e registrar o erro', () => {
    const exception = new HttpException(
      'Erro de teste',
      HttpStatus.BAD_REQUEST,
    );

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({
      method: 'GET',
      url: '/rota-teste',
    });

    const mockHost = {
      switchToHttp: () => ({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Erro de teste',
        path: '/rota-teste',
      }),
    );
  });

  it('deve lidar com erro genérico', () => {
    const exception = new Error('Erro genérico');

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({
      method: 'POST',
      url: '/rota-erro',
    });

    const mockHost = {
      switchToHttp: () => ({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Erro genérico',
        path: '/rota-erro',
      }),
    );
  });
});
