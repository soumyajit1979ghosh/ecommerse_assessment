/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import Countdown from "./components/Countdown";
import ProductCard from "./components/ProductCard";

type Product = {
	id: number;
	title: string;
	price: number;
	stock: number;
};

const API = "http://localhost:8877";

function App() {
	const [product] = useState<Product>({
		id: 1,
		title: "FlashKart Wireless Headphones",
		price: 79.99,
		stock: 37,
	});
	const [reservation, setReservation] = useState<any>(null);
	const [message, setMessage] = useState("");

	const expiresAt = reservation?.expiresAt;
	const handleExpire = useMemo(
		() => () => {
			setReservation(null);
			setMessage(
				"Your 5-minute reservation expired. Stock has been released.",
			);
		},
		[],
	);

	async function checkout() {
		if (!reservation) return;
		const jwt = localStorage.getItem("flashkart_token");
		const key = crypto.randomUUID();

		const response = await fetch(`${API}/order/checkout`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Idempotency-Key": key,
				...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
			},
			body: JSON.stringify({ cartItemId: reservation.cartItemId }),
		});

		const data = await response.json();
		if (!response.ok) {
			setMessage(data.error ?? "Checkout failed");
			return;
		}

		setMessage(`Order ${data.id} confirmed.`);
		setReservation(null);
	}

	return (
		<main className="page">
			<header>
				<h1>FlashKart</h1>
				<p>
					Limited stock. Atomic reservations. Five-minute checkout
					window.
				</p>
			</header>

			<ProductCard
				product={product}
				token={reservation?.reservationToken ?? null}
				onReserved={setReservation}
			/>

			{reservation && expiresAt && (
				<section className="timer">
					<span>Reservation expires in </span>
					<Countdown expiresAt={expiresAt} onExpire={handleExpire} />
					<button onClick={checkout}>Checkout</button>
				</section>
			)}

			{message && <p className="message">{message}</p>}
		</main>
	);
}

export default App;
