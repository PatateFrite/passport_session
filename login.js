
$('#login').on("click", function (e) {

	const username = $('input[name=username]').val();
	const password = $('input[name=password]').val();

	$
		.post("/token",
			{ username: username, password: password },
			"json")
		.success( (token) => {
			localStorage.setItem('token', token);
			console.log("token: " , token);
			window.location="/secret"
		})
		.error( (err) => {
			alert(err.statusText);
		})
});
