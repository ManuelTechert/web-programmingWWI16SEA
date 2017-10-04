var Cart = function (items) {
    this.cartItems = ko.computed(function () {
        return items.filter(function (item) {
            return item.count() > 0;
        });
    });

    this.asTotalFormatted = ko.computed(function () {
        var total = 0.0;
        ko.utils.arrayForEach(items, function (item) {
            total += item.price * item.count();
        });

        return total.toFixed(2) + ' €';
    });
};

var Pizza = function (pizza) {
    return Object.assign({}, pizza, {
        count: ko.observable(0),
        add: function () {
            this.count(Math.min(10, this.count() + 1));
        },
        remove: function () {
            this.count(Math.max(0, this.count() - 1));
        },
        asFormattedPrice: function () {
            return this.price.toFixed(2) + ' €';
        },
        asFormattedSum: function () {
            var price = this.count() * this.price;
             return price.toFixed(2) + ' €';
        },
        getToppings: function () {
            if (this.toppings.length >= 2) {
                var toppingList = [].concat(this.toppings),
                    lastTopping = toppingList.pop();
                return 'Mit ' + toppingList.join(', ') + ' und ' + lastTopping;
            }
            return 'Mit ' + this.toppings.join(', ');
        }
    });
}

var pizza = [
        new Pizza({ name: "Pizza Kaviar", meta: "Frische des Meeres", price: 5.00, imageSrc: "img/pz_caviar.jpg", toppings: ['Kaviar'] }),
        new Pizza({ name: "Pizza Peperoni", meta: "Schärfe Asiens", price: 5.50, imageSrc: "img/pz_hot-pepper.jpg", toppings: ['Peperoniwurst', 'Peperoni'] }),
        new Pizza({ name: "Pizza 4 Jahreszeiten", meta: "Frühling, Sommer, Herbst & Winter", price: 6.50, imageSrc: "img/pz_four-seasons.jpg", toppings: ['Brokkoli', 'Paprika', 'Zwiebeln', 'Schinken', 'Artischocken', 'Basilikum'] }),
        new Pizza({ name: "Pizza Rucola", meta: "Bitterer wirds nimmer", price: 6.00, imageSrc: "img/pz_roquette.jpg", toppings: ['Rucola', 'Tomate'] }),
        new Pizza({ name: "Pizza Schinken", meta: "Fleischig", price: 6.70, imageSrc: "img/pz_ham.jpg", toppings: ['Schinken', 'Rucola'] }),
        new Pizza({ name: "Pizzabrot", meta: "Gut & Günstig", price: 3.50, imageSrc: "img/pz_bread.jpg", toppings: ['ohne Belag'] }),
    ],
    cart = new Cart(pizza);

ko.applyBindings({
    pizza: pizza,
    cart: cart
});
