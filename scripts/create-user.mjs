// scripts/create-user.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const email = "DonSocialBar@donsocialbar.com";
  const password = "DonSocialBar2026";
  
  console.log(`Buscando/creando usuario administrador: ${email}...`);
  
  // Try to create the user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes("already exists") || error.status === 422) {
      console.log("El usuario ya existe. Actualizando contraseña...");
      // Find the user by email first
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Error listando usuarios:", listError.message);
        return;
      }
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: password
        });
        if (updateError) {
          console.error("Error al actualizar la contraseña:", updateError.message);
        } else {
          console.log("Contraseña actualizada exitosamente.");
        }
      } else {
        console.error("No se encontró el usuario en la lista para actualizar.");
      }
    } else {
      console.error("Error al crear usuario:", error.message);
    }
  } else {
    console.log("Usuario creado y confirmado exitosamente en Supabase Auth.");
  }
}
run();
