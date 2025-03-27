<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('game_matches', function (Blueprint $table) {
            $table->id();
            $table->string('match_code')->unique();
            $table->unsignedBigInteger('player1_id');
            $table->string('player1_name');
            $table->string('player1_symbol');
            $table->unsignedBigInteger('player2_id')->nullable();
            $table->string('player2_name')->nullable();
            $table->string('player2_symbol')->nullable();
            $table->json('board_state');
            $table->integer('moves_count')->default(0);
            $table->enum('status', ['waiting', 'playing', 'completed'])->default('waiting');
            $table->string('winner')->nullable();
            $table->string('current_turn')->default('X');
            $table->boolean('is_offline')->default(false);
            $table->timestamps();

            $table->foreign('player1_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');

            $table->foreign('player2_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null')
                  ->onUpdate('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_matches');
    }
}; 