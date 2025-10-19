// Web-safe database stub - PostgreSQL cannot run in browser
// All database operations should use API calls instead

export async function query(text: string, params?: any[]) {
    throw new Error('Database operations are not available on web. Please use API calls instead.');
}

export async function transaction(callback: (client: any) => Promise<any>) {
    throw new Error('Database transactions are not available on web. Please use API calls instead.');
}

export default {
    query,
    transaction
};
