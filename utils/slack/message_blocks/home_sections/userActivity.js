
async function addUserActivity(bmb) {
  const sessionCalls = await usePersistentItem('api', 'session-calls');
  const sessionCallsValue = await pipelineStatus.get();
  bmb.addSection({
    text: `*User Activity on Rex:*`
  })
  let maxListLength = 16
  for (const utcTime in sessionCallsValue) {
    const time = new Date(utcTime).toLocaleString();
    const sessionCalls = sessionCallsValue[utcTime];
    if (!sessionCall || !sessionCalls.length) continue;
    const usersPerClient = {}
    for (const call of sessionCalls) {
      if (!usersPerClient[call.client]) usersPerClient[call.client] = [];
      usersPerClient[call.client].push(call.email);
    }
    bmb.addSection({
      text: `*${time}*`
    })
    for (const client in usersPerClient) {
      bmb.addSection({
        text: ` - ${client}: ${usersPerClient[client].join(', ')}`
      })
    }
    maxListLength--;
    if (maxListLength <= 0) break;
  }
  bmb.addPadding({padding: 1})
  .addDivider();

  return bmb;
}