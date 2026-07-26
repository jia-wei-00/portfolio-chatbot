import { createRoute } from "honox/factory";

export default createRoute((c) => {
  return c.render(<h1>Hello!</h1>);
});
