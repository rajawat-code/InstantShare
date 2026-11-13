import socket
import os

HOST = os.getenv("MYSQL_DB_HOST", "localhost")
PORT = int(os.getenv("MYSQL_DB_PORT", "3306"))

print("=================================================")
print(f" Testing MySQL Port Connectivity: {HOST}:{PORT}")
print("=================================================")

try:
    s = socket.create_connection((HOST, PORT), timeout=5)
    print(f"✓ Successfully connected to MySQL at {HOST}:{PORT}!")
    # Read MySQL initial handshake greeting packet
    try:
        s.settimeout(2)
        greeting = s.recv(1024)
        if greeting:
            print(f"✓ MySQL Server Greeting Packet received ({len(greeting)} bytes)")
            # Extract server version string (null-terminated string starting at offset 5 in handshake packet)
            if len(greeting) > 5:
                null_idx = greeting.find(b'\x00', 5)
                if null_idx != -1:
                    version = greeting[5:null_idx].decode(errors='ignore')
                    print(f"✓ MySQL Server Version: {version}")
    except Exception:
        pass
    s.close()
    print("\n>>> MySQL port is open and accepting connections! <<<")
except Exception as e:
    print(f"\n❌ Connection failed: {type(e).__name__}: {e}")
    print("\nTroubleshooting tips:")
    print("1. Ensure MySQL service / daemon is running.")
    print("2. Check if MySQL is bound to port 3306.")
    print("3. Check your firewall settings.")

print("=================================================")
