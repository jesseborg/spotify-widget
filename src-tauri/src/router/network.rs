use super::RouterBuilder;

pub(crate) fn network_router() -> RouterBuilder {
  <RouterBuilder>::new()
		.query("status", |t| {
      t(|_ctx, _: ()| online::check(None).is_ok())
    })
}