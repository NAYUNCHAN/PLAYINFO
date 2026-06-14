import type { KraEndpointDefinition } from "./catalog.ts";
import { withRetry } from "./retry.ts";

export interface KraRequest {
  endpoint: KraEndpointDefinition;
  jobType: string;
  targetDate: string;
  params: Record<string, string | undefined>;
}

export class KraApiError extends Error {
  readonly details: {
    status?: number;
    endpointName: string;
    jobType: string;
    targetDate: string;
  };

  constructor(
    message: string,
    details: {
      status?: number;
      endpointName: string;
      jobType: string;
      targetDate: string;
    },
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "KraApiError";
    this.details = details;
  }
}

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * 인증 값이 포함된 전체 URL을 로그에 남기지 않고 KRA API를 호출합니다.
 *
 * 오류에는 운영자가 원인을 찾는 데 필요한 HTTP 상태, endpoint 이름, 작업 종류,
 * 대상 날짜만 포함합니다. 요청 URL에는 인증 키가 query string으로 들어가므로 URL
 * 자체나 Response 객체 전체는 출력하지 않습니다.
 */
export async function fetchKraJson({
  endpoint,
  jobType,
  targetDate,
  params,
}: KraRequest): Promise<unknown> {
  const apiKey = getRequiredEnvironmentVariable("KRA_API_KEY");
  const baseUrl = getRequiredEnvironmentVariable("KRA_API_BASE_URL");
  const url = new URL(endpoint.path, baseUrl);

  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("_type", "json");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "100");
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await withRetry(async () => {
    const result = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!result.ok) {
      throw new KraApiError(
        `KRA API request failed: status=${result.status}, endpoint=${endpoint.endpointName}, job_type=${jobType}, target_date=${targetDate}`,
        {
          status: result.status,
          endpointName: endpoint.endpointName,
          jobType,
          targetDate,
        },
      );
    }
    return result;
  });

  try {
    return await response.json();
  } catch (error) {
    throw new KraApiError(
      `KRA API response was not valid JSON: endpoint=${endpoint.endpointName}, job_type=${jobType}, target_date=${targetDate}`,
      {
        status: response.status,
        endpointName: endpoint.endpointName,
        jobType,
        targetDate,
      },
      { cause: error },
    );
  }
}
