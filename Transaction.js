// Define classes storing Transaction and Accounts
class Transaction {
    constructor(TrDate, From, To, Narrative, Amount) {
        this.TrDate = TrDate;
        this.From = From;
        this.To = To;
        this.Narrative = Narrative;
        this.Amount = Amount;
        // this.Processed = false;
    }
}
exports.Transaction = Transaction;
