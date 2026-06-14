import { fetchKraJson } from "../../lib/kra/client.ts";
import { getKraEndpoint } from "../../lib/kra/catalog.ts";
import { toKraDate } from "../../lib/kra/date.ts";
import { createSamplePath, saveKraSample } from "../../lib/kra/sample.ts";

interface CliOptions {
  job: string;
  date: string;
  racecourse: "SEOUL" | "BUSAN" | "JEJU";
  raceNo?: number;
  saveSample: boolean;
}

const RACECOURSE_CODES: Record<CliOptions["racecourse"], string> = {
  SEOUL: "1",
  JEJU: "2",
  BUSAN: "3",
};

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

/**
 * 초보 개발자도 누락된 입력을 바로 알 수 있도록 CLI 인자를 한곳에서 검증합니다.
 * 허용되지 않은 job은 endpoint catalog에서 거부하고, 파일명에 쓰이는 경마장과
 * 경주번호도 외부 요청 전에 제한합니다.
 */
export function parseCliOptions(args: string[]): CliOptions {
  const job = readOption(args, "--job");
  const date = readOption(args, "--date");
  const racecourse = readOption(args, "--racecourse")?.toUpperCase();
  const raceNoText = readOption(args, "--race-no");

  if (!job) {
    throw new Error("Missing required option: --job");
  }
  if (!date) {
    throw new Error("Missing required option: --date");
  }
  if (
    racecourse !== "SEOUL" &&
    racecourse !== "BUSAN" &&
    racecourse !== "JEJU"
  ) {
    throw new Error(
      "Invalid or missing --racecourse. Allowed values: SEOUL, BUSAN, JEJU",
    );
  }

  getKraEndpoint(job);

  let raceNo: number | undefined;
  if (raceNoText !== undefined) {
    raceNo = Number(raceNoText);
    if (!Number.isInteger(raceNo) || raceNo < 1 || raceNo > 99) {
      throw new Error("--race-no must be an integer between 1 and 99");
    }
  }

  return {
    job,
    date,
    racecourse,
    raceNo,
    saveSample: args.includes("--save-sample"),
  };
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const endpoint = getKraEndpoint(options.job);
  const kraDate = toKraDate(options.date);

  const payload = await fetchKraJson({
    endpoint,
    jobType: options.job,
    targetDate: options.date,
    params: {
      meet: RACECOURSE_CODES[options.racecourse],
      rc_date: kraDate,
      race_dt: kraDate,
      rc_no: options.raceNo?.toString(),
    },
  });

  console.log(
    `KRA PoC request succeeded: endpoint=${endpoint.endpointName}, job_type=${options.job}, target_date=${options.date}`,
  );

  if (options.saveSample) {
    const samplePath = createSamplePath({
      endpoint,
      racecourse: options.racecourse,
      kraDate,
      raceNo: options.raceNo,
    });
    await saveKraSample(samplePath, payload);
    console.log(`Sanitized PoC sample saved: ${samplePath}`);
  } else {
    console.log(
      "Response parsed as JSON. Use --save-sample only when a sanitized verification sample is required.",
    );
  }
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  new URL(import.meta.url).pathname === process.argv[1];

if (isDirectExecution) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unknown KRA PoC error");
    process.exitCode = 1;
  });
}
