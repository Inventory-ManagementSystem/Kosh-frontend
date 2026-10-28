const BASE_URL = import.meta.env.VITE_BASE_URL;

async function getStockMovements(
  accessToken,
  { page, pageSize, from, to, reason },
) {
  const params = new URLSearchParams({
    reason,
    page: String(page),
    page_size: String(pageSize),
  });

  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response = await fetch(
    `${BASE_URL}inventory/stock-movements/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to fetch stock movements.");
  }

  return result.data;
}

async function getAllMovementsForReason(accessToken, { from, to, reason }) {
  const pageSize = 100;
  let page = 1;
  let movements = [];

  while (true) {
    const data = await getStockMovements(accessToken, {
      page,
      pageSize,
      from,
      to,
      reason,
    });

    movements = movements.concat(data.results || []);

    if (!data.next || !data.results?.length) {
      break;
    }

    page += 1;
  }

  return movements;
}

export async function getReceivedStock(
  accessToken,
  { from = "", to = "" } = {},
) {
  const [received, dispatched] = await Promise.all([
    getAllMovementsForReason(accessToken, {
      from,
      to,
      reason: "grn_received",
    }),
    getAllMovementsForReason(accessToken, {
      from,
      to,
      reason: "dispatch",
    }),
  ]);

  const results = [...received, ...dispatched].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return {
    count: results.length,
    results,
  };
}
