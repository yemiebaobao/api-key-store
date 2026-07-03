// 卖家通过这个脚本，把 seed/api-keys.json 里的 Key 批量导入系统
// 用法：node scripts/seed.mjs
//
// 系统会启动一个临时的 HTTP 请求去 /api/seed 导入
// 所以需要先启动 dev server

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SEED_SECRET || "change-me";

async function main() {
  // 读取 Key 文件
  const { readFileSync, existsSync } = await import("fs");
  const keysPath = new URL("../seed/api-keys.json", import.meta.url);

  if (!existsSync(keysPath)) {
    console.error("❌ seed/api-keys.json 不存在");
    console.log("请先在 seed/api-keys.json 里填入你要卖的 API Key");
    process.exit(1);
  }

  const keys = JSON.parse(readFileSync(keysPath, "utf-8"));
  if (!Array.isArray(keys) || keys.length === 0) {
    console.error("❌ seed/api-keys.json 格式错误，需要是一个非空数组");
    process.exit(1);
  }

  console.log(`📦 找到 ${keys.length} 个 Key，开始导入...`);

  const res = await fetch(`${BASE_URL}/api/seed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({ keys }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ 成功导入 ${data.imported} 个 Key`);
    console.log(`📊 池子里还有 ${data.totalAvailable} 个 Key 可卖`);
  } else {
    console.error(`❌ 导入失败: ${data.error}`);
  }
}

main();
