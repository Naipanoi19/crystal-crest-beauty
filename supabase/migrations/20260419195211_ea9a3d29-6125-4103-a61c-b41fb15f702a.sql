
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit valid feedback" ON public.feedback
  FOR INSERT
  WITH CHECK (
    length(trim(customer_name)) > 0
    AND length(trim(message)) > 0
    AND rating BETWEEN 1 AND 5
  );
