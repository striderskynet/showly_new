const load = async ({ locals: { getSession } }) => {
  let session = await getSession();
  return {
    session
  };
};
export {
  load
};
