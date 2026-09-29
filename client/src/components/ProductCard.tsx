/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

type Product = {
	id: number;
	title: string;
	price: number;
	stock: number;
};

const API = "http://localhost:8877";

function ProductCard({
	product,
	token,
	onReserved,
}: {
	product: Product;
	token: string | null;
	onReserved: (data: any) => void;
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function reserve() {
		setLoading(true);
		setError("");
		try {
			const jwt = localStorage.getItem("flashkart_token");
			const response = await fetch(`${API}/cart/reserve`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
				},
				body: JSON.stringify({ productId: product.id, quantity: 1 }),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.error ?? "Reservation failed");
			onReserved(data);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<article className="card">
			<div className="badge">FLASH SALE</div>
			<h2>{product.title}</h2>
			<p className="price">${product.price.toFixed(2)}</p>
			<p>
				Remaining stock: <b>{product.stock}</b>
			</p>

			{token ? (
				<p className="reservation">
					Reserved. Complete checkout before the reservation expires.
				</p>
			) : (
				<button disabled={loading} onClick={reserve}>
					{loading ? "Reserving..." : "Add to Cart"}
				</button>
			)}

			{error && <p className="error">{error}</p>}
		</article>
	);
}

export default ProductCard;
