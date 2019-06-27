class Account {
    constructor(name) {
        this.name = name;
        this.Balance = 0;
        this.Transaction = [];
        this.updatedBalance = false;
        this.updatedTransaction = false;
    }
    CalculateBalance(WholeTransactionList) {
        var money = 0;
        for (let i = 0; i < WholeTransactionList.length; i++) {
            if (WholeTransactionList[i].From == this.name) {
                money = money - WholeTransactionList[i].Amount;
            }
            if (WholeTransactionList[i].To == this.name) {
                money = money + WholeTransactionList[i].Amount;
            }
        }
        this.updatedBalance = true;
        this.Balance = money;
        return;
    }
    PrintBalance(WholeTransactionList) {
        if (!this.updatedBalance)
            this.CalculateBalance(WholeTransactionList);
        return this.Balance;
    }
    UpdateTransaction(WholeTransactionList) {
        var ListTransaction = [];
        for (let i = 0; i < WholeTransactionList.length; i++) {
            if (WholeTransactionList[i].From == this.name || WholeTransactionList[i].To == this.name) {
                ListTransaction.push(WholeTransactionList[i]);
            }
        }
        this.updatedBalance = true;
        this.Transaction = ListTransaction;
        return;
    }
    PrintTransaction(WholeTransactionList) {
        if (!this.updatedTransaction)
            this.UpdateTransaction(WholeTransactionList);
        return this.Transaction;
    }
}
exports.Account = Account;
