CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- 1. Insert into users table
    INSERT INTO public.users (id, email, user_type, record_status, created_at)
    VALUES (NEW.id, NEW.email, 'USER', 'INACTIVE', NOW());

    -- 2. Insert rights (5 modules × 1 VIEW right = 5 rows, plus 12 other rights = 17 total)
    INSERT INTO public."UserModule_Rights" (user_id, module_id, right_id, is_allowed)
    VALUES
        -- VIEW rights (right_id = 1) for modules 9,10,11,12,13
        (NEW.id, 9, 1, 1), (NEW.id, 10, 1, 1), (NEW.id, 11, 1, 1), (NEW.id, 12, 1, 1), (NEW.id, 13, 1, 1),
        -- Other rights (right_id 2,3,4) with is_allowed = 0
        (NEW.id, 9, 2, 0), (NEW.id, 9, 3, 0), (NEW.id, 9, 4, 0),
        (NEW.id, 10, 2, 0), (NEW.id, 10, 3, 0), (NEW.id, 10, 4, 0),
        (NEW.id, 11, 2, 0), (NEW.id, 11, 3, 0),
        (NEW.id, 12, 2, 0),
        (NEW.id, 13, 2, 0), (NEW.id, 13, 3, 0), (NEW.id, 13, 4, 0);

    RETURN NEW;
END;
$$;
