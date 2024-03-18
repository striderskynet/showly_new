// src/routes/admin/+layout.server.js

export const load = async ({ locals: { getSession } }) => {
    let session = await getSession();

    return {
        session: session,
    }
}