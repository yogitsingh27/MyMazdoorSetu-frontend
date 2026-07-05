# Deployment

> This document is being built out during the **Beta Polish milestone** (Phase 6).
> The section below was captured early per a Phase 1 follow-up; the full runbook
> (build, environment/secrets, migrations, topology, health checks, rate limits)
> lands in Phase 6.

## Reverse proxy & forwarded headers

The API calls `UseForwardedHeaders()` (X-Forwarded-For / X-Forwarded-Proto) so that
`Request.IsHttps` and the client IP are accurate behind a TLS-terminating reverse
proxy or load balancer. This is what makes the refresh cookie's
`Secure = Request.IsHttps` correct in production.

In `Program.cs` the forwarded-headers options **clear** `KnownNetworks` and
`KnownProxies`:

```csharp
o.KnownNetworks.Clear();
o.KnownProxies.Clear();
```

- **This is appropriate for the current deployment approach**, where the app is only
  reachable through the platform's own proxy (e.g. a managed PaaS / container platform
  whose ingress terminates TLS) and is not directly exposed to clients. Clearing the
  lists tells ASP.NET Core to trust the forwarded headers from that single hop.
- **Deployments with a known, fixed reverse proxy should configure these explicitly**
  for a tighter security posture — add the proxy's address to `KnownProxies` (or its
  subnet to `KnownNetworks`) instead of clearing them, so forged `X-Forwarded-*`
  headers from any other source are ignored:

  ```csharp
  o.KnownProxies.Add(IPAddress.Parse("10.0.0.4"));      // your proxy's IP
  // or, for a proxy subnet:
  o.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("10.0.0.0"), 24));
  ```

  Prefer sourcing these from configuration/environment so they can differ per
  environment without a code change.

If the app is ever exposed directly to the internet (no proxy), do **not** trust
forwarded headers at all — remove `UseForwardedHeaders()` or leave the known lists
un-cleared and empty.
