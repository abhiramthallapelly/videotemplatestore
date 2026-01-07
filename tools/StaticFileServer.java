import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class StaticFileServer {
    public static void main(String[] args) throws Exception {
        int port = 3000;
        String baseDir = ".";
        if (args.length > 0) {
            try { port = Integer.parseInt(args[0]); } catch (Exception ignored) {}
        }
        if (args.length > 1) baseDir = args[1];

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new FileHandler(baseDir));
        server.setExecutor(null);
        System.out.println("Static server running on http://localhost:" + port + " (base dir: " + baseDir + ")");
        server.start();
    }

    static class FileHandler implements HttpHandler {
        private final Path base;
        FileHandler(String baseDir) {
            this.base = Paths.get(baseDir).toAbsolutePath().normalize();
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            URI uri = exchange.getRequestURI();
            String path = uri.getPath();
            if (path.endsWith("/")) path += "index.html";
            Path resolved = base.resolve(path.substring(1)).normalize();

            if (!resolved.startsWith(base) || !Files.exists(resolved) || Files.isDirectory(resolved)) {
                String notFound = "404 Not Found";
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes());
                }
                return;
            }

            String contentType = Files.probeContentType(resolved);
            if (contentType == null) contentType = "application/octet-stream";

            exchange.getResponseHeaders().set("Content-Type", contentType + "; charset=utf-8");
            long length = Files.size(resolved);
            exchange.sendResponseHeaders(200, length);
            try (OutputStream os = exchange.getResponseBody(); InputStream is = Files.newInputStream(resolved)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    os.write(buffer, 0, read);
                }
            }
        }
    }
}
