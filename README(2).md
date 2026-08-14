A Closed Knight's Tour, by: Jonathan McKinney

Based On My 4 Basic Coding Principles,
Storing, Sending, Processing, & Saving

A Knight can move in multiples of 2 ways in 4 different directions at the center of the board, so 4*2 = 8 Different Directions

//Store 
Knight_64Bitboard[8][8];
//Save

//8 Sends In A Sort, 2 Processes In A Search For A 2D Array

     Draw_KnightMove(Offset = 1){
        //Knight's Directives
	i = 1; j = 1;
	Knight_64Bitboard[i][j] = Offset;
        //Up 1 or Down 1 is adding or subtracting rows
        //Left 2 or Right 2 is subtracting or adding columns
        //The Full Board is Processed as the boundaries are Checked For 8 Types Of Knight Moves
        //First Fit Best Fit
      For(i = 0; i < 8; i++){
       For(j = 0; j < 8; j++){
       try(Exception E)
        if Knight_64Bitboard[i + 1][j + 2] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
	else Throw E;
	if Knight_64Bitboard[i - 1][j + 2] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i + 1][j - 2] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i - 1][j - 2] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i + 2][j + 1] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i - 2][j + 1] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i + 2][j - 1] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
	if Knight_64Bitboard[i - 2][j - 1] > -1 || Knight_64Bitboard[i + 1][j + 2] < 8
        else Throw E;
       catch
	//Picks 1 Legal Move
	Offset = Rand(Knight_64Bitboard[i][j] % 8);
       }
      }
 Return Offset;
}
