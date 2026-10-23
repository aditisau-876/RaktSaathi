"""Optional Snowflake warehouse utilities. The app runs on SQLite by default.
Do not put Snowflake credentials in frontend code or commit .env.
"""
from .config import settings

def connection():
    if not settings.snowflake_configured:
        raise RuntimeError('Snowflake credentials are not configured')
    import snowflake.connector
    kwargs=dict(account=settings.snowflake_account,user=settings.snowflake_user,password=settings.snowflake_password,
                warehouse=settings.snowflake_warehouse,database=settings.snowflake_database,schema=settings.snowflake_schema)
    if settings.snowflake_role: kwargs['role']=settings.snowflake_role
    return snowflake.connector.connect(**kwargs)

def test_connection():
    conn=connection()
    try:
        cur=conn.cursor()
        try:
            cur.execute('SELECT CURRENT_VERSION(), CURRENT_DATABASE(), CURRENT_SCHEMA()')
            row=cur.fetchone()
            return {'connected':True,'version':row[0],'database':row[1],'schema':row[2]}
        finally: cur.close()
    finally: conn.close()
