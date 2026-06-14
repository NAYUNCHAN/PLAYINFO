export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Project foundation
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Race Note</h1>
        <p className="mt-5 max-w-xl leading-7 text-slate-600">
          KRA 공공데이터 API 검증과 수집 구조 설계를 시작하기 위한 초기
          프로젝트입니다. 일본 경마 정보는 JRA 공식 페이지에서 확인하고 필요한
          내용을 수동으로 기록하는 방향으로 준비합니다.
        </p>
      </section>
    </main>
  );
}
