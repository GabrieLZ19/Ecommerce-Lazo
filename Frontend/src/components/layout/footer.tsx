import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">LAZO</h3>
            <p className="text-sm text-muted-foreground">
              Descubre la moda que define tu estilo. Calidad premium y
              tendencias actuales.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=men"
                  className="text-muted-foreground hover:text-primary"
                >
                  Hombres
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=women"
                  className="text-muted-foreground hover:text-primary"
                >
                  Mujeres
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories"
                  className="text-muted-foreground hover:text-primary"
                >
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold">Atención al Cliente</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help/shipping"
                  className="text-muted-foreground hover:text-primary"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/help/returns"
                  className="text-muted-foreground hover:text-primary"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/help/size-guide"
                  className="text-muted-foreground hover:text-primary"
                >
                  Guía de Talles
                </Link>
              </li>
              <li>
                <Link
                  href="/help/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@lazo.com.ar</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} LAZO. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-primary">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
