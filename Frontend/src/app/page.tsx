import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Star } from "lucide-react";

export default function HomePage() {
  // Datos de ejemplo para productos destacados
  const featuredProducts = [
    {
      id: "1",
      name: "Vestido Elegante Negro",
      price: 89900,
      image: "/images/products/dress-1.jpg",
      category: "Vestidos",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Camisa Casual Blanca",
      price: 45900,
      image: "/images/products/shirt-1.jpg",
      category: "Camisas",
      rating: 4.7,
    },
    {
      id: "3",
      name: "Jeans Slim Fit",
      price: 67900,
      image: "/images/products/jeans-1.jpg",
      category: "Pantalones",
      rating: 4.9,
    },
    {
      id: "4",
      name: "Blazer Formal",
      price: 129900,
      image: "/images/products/blazer-1.jpg",
      category: "Sacos",
      rating: 4.6,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg"
            alt="Nueva Colección"
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLiHN6v0/g=="
          />
        </div>
        <div className="relative z-20 text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nueva Colección
            <span className="block text-3xl md:text-5xl mt-2">Otoño 2024</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Descubre las últimas tendencias en moda. Estilos únicos que definen
            tu personalidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/products">
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/products?category=women">Colección Mujer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explora por Categoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products?category=women" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/categories/women.jpg"
                  alt="Ropa de Mujer"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">Mujer</h3>
                  <p className="text-sm">Nueva temporada</p>
                </div>
              </div>
            </Link>

            <Link href="/products?category=men" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/categories/men.jpg"
                  alt="Ropa de Hombre"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">Hombre</h3>
                  <p className="text-sm">Estilos únicos</p>
                </div>
              </div>
            </Link>

            <Link href="/products?category=accessories" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/categories/accessories.jpg"
                  alt="Accesorios"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">Accesorios</h3>
                  <p className="text-sm">Completa tu look</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Productos Destacados</h2>
            <Button asChild variant="outline">
              <Link href="/products">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="card-product">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Mantente al día</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Suscríbete a nuestro newsletter y recibe las últimas novedades,
            ofertas exclusivas y tendencias de moda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-2 rounded-md text-black"
            />
            <Button variant="secondary">Suscribirse</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
