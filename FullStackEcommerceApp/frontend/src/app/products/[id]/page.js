import AddToCart from '../../../components/AddToCart';

async function fetchProduct(id) {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetail({ params }) {
  const product = await fetchProduct(params.id);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <p className="text-center text-gray-600 text-lg">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <p className="text-sm text-gray-500">Category: <span className="font-medium">{product.category}</span></p>
          <p className="text-xl text-indigo-600 font-semibold">${product.price.toFixed(2)}</p>
        </div>

        <AddToCart productId={product._id} />
      </div>
    </div>
  );
}
